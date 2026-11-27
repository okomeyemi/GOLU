
import {
  admin,
  userFrom,
  json,
  consume,
  kimi,
  safeJson
} from './_shared.mjs';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const u = await userFrom(request);
    const d = await request.json();

    if (
      typeof d.projectId !== 'string' ||
      typeof d.message !== 'string' ||
      !d.projectId.trim() ||
      !d.message.trim()
    ) {
      throw new Error('Project and message are required.');
    }

    if (d.message.length > 12000) {
      throw new Error('Your message is too long.');
    }

    const { db } = admin();
    const ref = db.collection('projects').doc(d.projectId);
    const snap = await ref.get();

    if (!snap.exists || snap.data().uid !== u.uid) {
      return json(404, { error: 'Project not found.' });
    }

    const data = snap.data();
    const assets = data.business?.assets || [];
    const refs = data.business?.referenceImageUrls || [];

    // Preserve all image details in text.
    const assetInstructions = assets.map((a, i) => ({
      number: i + 1,
      name: a.name || '',
      placement: a.placement || '',
      description: a.description || '',
      notes: a.notes || '',
      exactImageUrl: a.url
    }));

    const referenceInstructions = refs.map((url, i) => ({
      number: i + 1,
      exactImageUrl: url,
      purpose: 'Design inspiration only.'
    }));

    // Groq Qwen accepts at most 3 images per request.
    const visualImages = [
      ...assets.map(a => ({
        label: `Business asset: ${a.name || 'Customer image'}`,
        url: a.url
      })),
      ...refs.map((url, i) => ({
        label: `Design reference ${i + 1}`,
        url
      }))
    ].filter(a => typeof a.url === 'string').slice(0, 3);

    const system = `You are GOLU, an expert website coding and editing AI.

Apply the customer's requested changes to their complete website specification.

Return valid JSON only:
{
  "summary": "Brief description of changes",
  "siteSpec": {}
}

IMPORTANT:
- Preserve existing pages and sections unless asked to change them.
- Do not remove existing business information unnecessarily.
- Preserve existing design choices unless asked to change them.
- Use customer-uploaded image URLs exactly.
- Never invent image URLs.
- Respect image placement instructions.
- Keep the website responsive and professional.
- Make only the requested changes.
- Return the complete updated website specification.

CUSTOMER BUSINESS ASSETS:
${JSON.stringify(assetInstructions)}

DESIGN REFERENCES:
${JSON.stringify(referenceInstructions)}

CURRENT WEBSITE SPECIFICATION:
${JSON.stringify(data.siteSpec || {})}`;

    // Only accept ordinary user/assistant chat history.
    const history = Array.isArray(d.history)
      ? d.history
          .filter(
            item =>
              item &&
              ['user', 'assistant'].includes(item.role) &&
              typeof item.content === 'string'
          )
          .slice(-10)
          .map(item => ({
            role: item.role,
            content: item.content.slice(0, 12000)
          }))
      : [];

    const userContent = [
      {
        type: 'text',
        text: d.message
      }
    ];

    for (const item of visualImages) {
      userContent.push({
        type: 'text',
        text: item.label
      });

      userContent.push({
        type: 'image_url',
        image_url: { url: item.url }
      });
    }

    const raw = await kimi([
      {
        role: 'system',
        content: system
      },
      ...history,
      {
        role: 'user',
        content: userContent
      }
    ]);

    const result = safeJson(raw);

    if (
      !result.siteSpec ||
      !Array.isArray(result.siteSpec.pages) ||
      !result.siteSpec.pages.length
    ) {
      throw new Error(
        'AI returned an incomplete update. Your website was not changed.'
      );
    }

    // Charge a credit only after a valid AI response.
    const usage = await consume(u.uid, 'changes');

    await ref.update({
      siteSpec: result.siteSpec,
      updatedAt: new Date()
    });

    await ref.collection('messages').add({
      uid: u.uid,
      role: 'user',
      content: d.message,
      createdAt: new Date()
    });

    await ref.collection('messages').add({
      uid: u.uid,
      role: 'assistant',
      content: String(result.summary || 'Website updated.'),
      createdAt: new Date()
    });

    return json(200, {
      ok: true,
      answer: String(result.summary || 'Website updated.'),
      siteSpec: result.siteSpec,
      usage
    });

  } catch (e) {
    console.error('Groq chat editing error:', e);

    return json(e.statusCode || 500, {
      error: e.message || 'Unable to update your website.'
    });
  }
}
