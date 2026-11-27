
import {
  admin,
  userFrom,
  json,
  consume,
  plans,
  planOf,
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
    const { db } = admin();

    for (const k of ['businessName', 'category', 'description']) {
      if (
        typeof d[k] !== 'string' ||
        d[k].trim().length < (k === 'description' ? 10 : 2)
      ) {
        throw new Error(`Please provide a valid ${k}.`);
      }
    }

    if (!Array.isArray(d.pages) || !d.pages.length) {
      throw new Error('Choose at least one page.');
    }

    const user = await db.collection('users').doc(u.uid).get();
    const plan = planOf(user.data()?.plan);

    const refs = d.referenceImageUrls || [];
    const assets = d.assets || [];

    if (!Array.isArray(refs) || !Array.isArray(assets)) {
      throw new Error('Invalid image data.');
    }

    if (refs.length > plans[plan].referenceImages) {
      throw new Error(
        `${plan} allows up to ${plans[plan].referenceImages} reference images.`
      );
    }

    if (assets.length > 30) {
      throw new Error('Maximum 30 business images.');
    }

    for (const a of assets) {
      if (!a || typeof a.url !== 'string') {
        throw new Error('Invalid business image.');
      }

      const url = new URL(a.url);

      if (
        url.protocol !== 'https:' ||
        url.hostname !== 'firebasestorage.googleapis.com' ||
        !decodeURIComponent(url.pathname).includes(
          `/users/${u.uid}/assets/`
        )
      ) {
        throw new Error(
          'An uploaded image does not belong to this account.'
        );
      }
    }

    for (const urlValue of refs) {
      if (typeof urlValue !== 'string') {
        throw new Error('Invalid reference image.');
      }

      const url = new URL(urlValue);

      if (
        url.protocol !== 'https:' ||
        url.hostname !== 'firebasestorage.googleapis.com' ||
        !decodeURIComponent(url.pathname).includes(
          `/users/${u.uid}/`
        )
      ) {
        throw new Error(
          'A reference image does not belong to this account.'
        );
      }
    }

    // Preserve every business image and its placement instructions.
    const assetInstructions = assets.map((a, i) => ({
      number: i + 1,
      name: a.name || '',
      placement: a.placement || '',
      description: a.description || '',
      notes: a.notes || '',
      exactImageUrl: a.url
    }));

    // Preserve all reference URLs and their design purpose.
    const referenceInstructions = refs.map((url, i) => ({
      number: i + 1,
      exactImageUrl: url,
      purpose: 'Visual design inspiration only. Do not copy.'
    }));

    const prompt = `Create a complete, original, responsive business website specification.

Return valid JSON only.

Required shape:
{
  "siteName":"",
  "tagline":"",
  "design":{
    "style":"",
    "colors":[],
    "typography":"",
    "layoutNotes":""
  },
  "navigation":[],
  "pages":[{
    "name":"",
    "slug":"",
    "sections":[{
      "type":"hero|features|services|about|testimonials|gallery|faq|contact|cta|footer",
      "heading":"",
      "body":"",
      "items":[],
      "buttonText":"",
      "buttonLink":"",
      "imageUrl":"",
      "imageAlt":""
    }]
  }],
  "assets":[],
  "seo":{
    "title":"",
    "description":"",
    "keywords":[]
  },
  "businessData":{}
}

BUSINESS BRIEF:
${JSON.stringify(d)}

CUSTOMER BUSINESS IMAGES:
${JSON.stringify(assetInstructions)}

DESIGN REFERENCE IMAGES:
${JSON.stringify(referenceInstructions)}

IMPORTANT RULES:
1. Use customer business image URLs exactly as supplied.
2. Never invent, modify or replace customer image URLs.
3. Respect every image's specified placement.
4. Use the supplied image descriptions and notes.
5. Reference images are design inspiration only.
6. Do not copy reference websites or their content.
7. Create original layouts and business-specific content.
8. Return every requested page.
9. Do not omit supplied business assets from the website specification.
10. Return valid JSON without Markdown fences.`;

    // Groq Qwen accepts a maximum of three images per request.
    // Business images receive visual priority; reference images
    // use any remaining visual slots.
    const visualInputs = [
      ...assets.map((a, i) => ({
        label: `Business image ${i + 1}: ${a.name || 'Customer image'}`,
        url: a.url
      })),
      ...refs.map((url, i) => ({
        label: `Design reference ${i + 1}`,
        url
      }))
    ].slice(0, 3);

    const content = [
      { type: 'text', text: prompt }
    ];

    for (const item of visualInputs) {
      content.push({
        type: 'text',
        text: item.label
      });

      content.push({
        type: 'image_url',
        image_url: { url: item.url }
      });
    }

    const raw = await kimi([
      {
        role: 'system',
        content:
          'You are GOLU, a senior website designer and coding assistant. Produce complete, original, responsive website specifications. Return valid JSON only.'
      },
      {
        role: 'user',
        content
      }
    ]);

    const siteSpec = safeJson(raw);

    if (!Array.isArray(siteSpec.pages) || !siteSpec.pages.length) {
      throw new Error(
        'AI returned an incomplete website. Please try again.'
      );
    }

    const usage = await consume(u.uid, 'generations');

    const ref = db.collection('projects').doc();

    await ref.set({
      uid: u.uid,
      name: d.businessName,
      business: d,
      siteSpec,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return json(200, {
      ok: true,
      projectId: ref.id,
      siteSpec,
      usage
    });

  } catch (e) {
    console.error('Website generation error:', e);

    return json(e.statusCode || 500, {
      error: e.message || 'Generation failed.'
    });
  }
}
