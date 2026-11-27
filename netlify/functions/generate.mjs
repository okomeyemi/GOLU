
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

    const prompt = `Create a complete original responsive website specification as JSON only.

Shape:
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

Business brief: ${JSON.stringify(d)}

Use supplied customer image URLs exactly and obey each placement.
Reference images are style inspiration only; do not copy.
Make all text specific to this business.`;

    const parts = assets.flatMap(a => [
      {
        type: 'text',
        text: `Business image ${a.name}; placement ${a.placement}; description ${a.description || ''}; instructions ${a.notes || ''}`
      },
      {
        type: 'image_url',
        image_url: { url: a.url }
      }
    ]).concat(
      refs.flatMap((url, i) => [
        {
          type: 'text',
          text: `Design reference ${i + 1}: inspiration only.`
        },
        {
          type: 'image_url',
          image_url: { url }
        }
      ])
    );

    const raw = await kimi([
      {
        role: 'system',
        content: 'You are GOLU, a senior website designer and coding assistant. Return valid JSON only. Never fabricate image URLs.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...parts
        ]
      }
    ]);

    const siteSpec = safeJson(raw);

    if (!Array.isArray(siteSpec.pages)) {
      throw new Error('AI returned an incomplete website. Try again.');
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
