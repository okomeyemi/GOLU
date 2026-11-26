import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth-server';
import { askKimi } from '@/lib/ai';
import { consume } from '@/lib/usage';
import { adminDb, FieldValue } from '@/lib/admin';

const schema = z.object({
  projectId: z.string().min(1),
  message: z.string().min(1).max(12000),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(12000) })).max(20).optional()
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req), body = schema.parse(await req.json());
    const project = await adminDb().collection('projects').doc(body.projectId).get();
    if (!project.exists || project.data()?.uid !== user.uid) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });

    const data = project.data() || {};
    const usage = await consume(user.uid, 'changes');
    const savedAssets = data.business?.assets || [];
    const system = `You are GOLU, the website coding and editing engine. Apply the customer's requested change directly to the website specification; do not merely give advice. Return valid JSON only in this exact shape: {"summary":"Short explanation of what changed","siteSpec":{...the complete updated website specification...}}. Preserve every existing page, section, business detail, and asset unless the customer asks to change or remove it. Uploaded business assets and their required placements: ${JSON.stringify(savedAssets)}. Use these real assets in their assigned locations, preserve their URLs exactly, and never invent image URLs. If the customer asks for a new section, add it to the appropriate page. If a request is ambiguous, make the safest reasonable improvement and explain it in summary. Current complete website specification: ${JSON.stringify(data.siteSpec || {})}.`;
    const imageParts = savedAssets.flatMap((asset: any) => [
      { type: 'text' as const, text: `Business image ${asset.name}; collection: ${asset.collection || 'General'}; required placement: ${asset.placement}; description: ${asset.description || ''}; instructions: ${asset.notes || ''}` },
      { type: 'image_url' as const, image_url: { url: asset.url } }
    ]);
    const designRefs = (data.business?.referenceImageUrls || []).slice(0, 6).flatMap((url: string, i: number) => [
      { type: 'text' as const, text: `Design reference ${i + 1}: style inspiration only.` },
      { type: 'image_url' as const, image_url: { url } }
    ]);
    imageParts.push(...designRefs);
    const userContent = imageParts.length
      ? [{ type: 'text' as const, text: body.message }, ...imageParts]
      : body.message;
    const raw = await askKimi([
      { role: 'system', content: system },
      ...(body.history || []),
      { role: 'user', content: userContent }
    ]);

    let result: any;
    try {
      result = JSON.parse(raw.replace(/^```(?:json)?/i, '').replace(/```$/,'').trim());
    } catch {
      throw new Error('Kimi could not return a valid website update. Your current website has not been changed. Please try a more specific instruction.');
    }
    if (!result?.siteSpec || !Array.isArray(result.siteSpec.pages)) {
      throw new Error('Kimi returned an incomplete website update. Your current website has not been changed.');
    }

    await project.ref.update({ siteSpec: result.siteSpec, updatedAt: FieldValue.serverTimestamp() });
    await project.ref.collection('messages').add({ uid: user.uid, role: 'user', content: body.message, createdAt: FieldValue.serverTimestamp() });
    await project.ref.collection('messages').add({ uid: user.uid, role: 'assistant', content: String(result.summary || 'Website updated.'), createdAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ answer: String(result.summary || 'Website updated.'), siteSpec: result.siteSpec, usage });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Request failed.' }, { status: e.message?.includes('Sign in') ? 401 : 400 });
  }
}
