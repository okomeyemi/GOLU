import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth-server';
import { adminDb, FieldValue } from '@/lib/admin';
import { askKimi } from '@/lib/ai';
import { consume } from '@/lib/usage';
import { getPlan, PLANS } from '@/lib/plans';

const schema=z.object({
  businessName:z.string().min(2),category:z.string().min(2),description:z.string().min(10),
  audience:z.string().optional(),location:z.string().optional(),phone:z.string().optional(),
  email:z.string().optional(),whatsapp:z.string().optional(),services:z.string().optional(),
  style:z.string().optional(),colors:z.string().optional(),pages:z.array(z.string()).min(1),
  extra:z.string().optional(),referenceImageUrls:z.array(z.string().url()).max(6).optional(),assets:z.array(z.object({name:z.string().min(1).max(120),collection:z.string().max(120).optional(),url:z.string().url(),placement:z.string().min(1).max(120),description:z.string().max(500).optional(),notes:z.string().max(500).optional()})).max(30).optional()
});
export async function POST(req:NextRequest) {
 try {
  const user=await requireUser(req), data=schema.parse(await req.json()), db=adminDb();
  const userRef=db.collection('users').doc(user.uid), userSnap=await userRef.get();
  const plan=getPlan(userSnap.data()?.plan), max=PLANS[plan].referenceImages;
  const refs=data.referenceImageUrls||[];
  if(refs.length>max) return NextResponse.json({error:`${plan} allows up to ${max} reference images.`},{status:400});
  const assets=data.assets||[];
  const bucket=process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  for(const asset of assets){
    const url=new URL(asset.url);
    const decoded=decodeURIComponent(url.pathname);
    if(url.hostname!=='firebasestorage.googleapis.com'||(bucket&&!decoded.includes(`/b/${bucket}/`))||!decoded.includes(`/users/${user.uid}/assets/`))
      return NextResponse.json({error:'An uploaded image URL does not belong to this account. Please upload it again.'},{status:400});
  }
  const usage=await consume(user.uid,'generations');
  const prompt=`Create a complete, original, responsive website specification as valid JSON only. Do not use markdown fences. Structure: {"siteName":"","tagline":"","design":{"style":"","colors":[],"typography":"","layoutNotes":""},"navigation":[],"pages":[{"name":"","slug":"","sections":[{"type":"hero|features|services|about|testimonials|gallery|faq|contact|cta|footer","heading":"","body":"","items":[],"buttonText":"","buttonLink":"","imageUrl":"","imageAlt":""}]}],"assets":[{"name":"","url":"","placement":"","alt":""}],"seo":{"title":"","description":"","keywords":[]},"businessData":{}}. Business details: ${JSON.stringify(data)}.

ASSET PLACEMENT RULES: The business assets list contains real uploaded customer images. Use each asset's URL and follow its placement instruction exactly (examples: homepage hero, logo in header, product card, gallery, team section, background). Preserve the supplied URL exactly; do not invent replacement image URLs. Use the description and notes to choose appropriate alt text, crop, and context. Do not treat customer assets as style references. If an asset placement is unclear, put it in a sensible gallery and mention the decision in layoutNotes.

Reference image URLs are separate design inspiration only; do not copy their exact design. Make all text specific to this business.`;
  const imageParts=assets.flatMap((asset:{name:string;url:string;placement:string;description?:string;notes?:string})=>[
    {type:'text' as const,text:`Business image: ${asset.name}. Collection: ${asset.collection||'General'}. Required placement: ${asset.placement}. Description: ${asset.description||'Not supplied'}. Instructions: ${asset.notes||'None'}.`},
    {type:'image_url' as const,image_url:{url:asset.url}}
  ]).concat((refs).flatMap((url:string,i:number)=>[
    {type:'text' as const,text:`Design reference image ${i+1}: use only as visual style inspiration; do not copy it.`},
    {type:'image_url' as const,image_url:{url}}
  ]));
  const raw=await askKimi([{role:'system',content:'You are GOLU, a senior website designer and full-stack website coding assistant. Return valid JSON only. Treat customer-uploaded assets as real content and obey their placement instructions. Visually inspect the supplied images, identify their contents, and use each only in its assigned website location. Never fabricate image URLs.'},{role:'user',content:[{type:'text',text:prompt},...imageParts]}]);
  let siteSpec:any;
  try { siteSpec=JSON.parse(raw.replace(/^```(?:json)?/,'').replace(/```$/,'').trim()); }
  catch { throw new Error('The AI returned an invalid website specification. Please try again.'); }
  const ref=db.collection('projects').doc();
  await ref.set({uid:user.uid,name:data.businessName,business:data,siteSpec,status:'draft',createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
  return NextResponse.json({projectId:ref.id,siteSpec,usage});
 } catch(e:any){return NextResponse.json({error:e.message||'Generation failed.'},{status:e.message?.includes('Sign in')?401:400});}
}
