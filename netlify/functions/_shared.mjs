import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
export function admin(){
  if(!getApps().length){
    const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if(!raw) throw new Error('Firebase Admin is not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON in Netlify.');
    const service=JSON.parse(raw);
    initializeApp({credential:cert(service), ...(process.env.FIREBASE_STORAGE_BUCKET?{storageBucket:process.env.FIREBASE_STORAGE_BUCKET}:{})});
  }
  return {auth:getAuth(),db:getFirestore()};
}
export async function userFrom(event){
  const h=event.headers.authorization||event.headers.Authorization||'';
  if(!h.startsWith('Bearer ')) throw Object.assign(new Error('Sign in to continue.'),{statusCode:401});
  return admin().auth.verifyIdToken(h.slice(7));
}
export const json=(statusCode,body)=>({statusCode,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify(body)});
export const parse=event=>JSON.parse(event.body||'{}');
export const plans={basic:{referenceImages:3,monthlyChanges:10,monthlyGenerations:2},pro:{referenceImages:6,monthlyChanges:50,monthlyGenerations:10}};
export const planOf=x=>x==='pro'?'pro':'basic';
export async function consume(uid,kind,amount=1){
 const {db}=admin(),month=new Date().toISOString().slice(0,7),ref=db.collection('usage').doc(`${uid}_${month}`);
 return db.runTransaction(async tx=>{const snap=await tx.get(ref),u=await db.collection('users').doc(uid).get(),p=planOf(u.data()?.plan),limit=kind==='changes'?plans[p].monthlyChanges:plans[p].monthlyGenerations,used=Number(snap.data()?.[kind]||0);if(used+amount>limit)throw new Error(`Monthly ${kind} allowance used. Your ${p} plan allows ${limit} per month.`);tx.set(ref,{uid,month,[kind]:used+amount,updatedAt:FieldValue.serverTimestamp()},{merge:true});return {used:used+amount,limit,remaining:limit-used-amount};});
}
export async function kimi(messages){
 const key=process.env.KIMI_API_KEY;if(!key)throw new Error('KIMI_API_KEY is missing. Add it to Netlify environment variables.');
 const base=(process.env.KIMI_BASE_URL||'https://api.moonshot.ai/v1').replace(/\/$/,''),r=await fetch(`${base}/chat/completions`,{method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({model:process.env.KIMI_MODEL||'kimi-k3.1-pro',messages,max_completion_tokens:12000,reasoning_effort:'low',response_format:{type:'json_object'},stream:false})});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.error?.message||`Kimi request failed (${r.status})`);const c=d?.choices?.[0]?.message?.content;if(typeof c!=='string'||!c.trim())throw new Error('Kimi returned an empty response.');return c;
}
export function safeJson(raw){return JSON.parse(raw.replace(/^```(?:json)?/i,'').replace(/```$/,'').trim());}
