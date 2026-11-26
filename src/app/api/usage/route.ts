import {NextRequest,NextResponse} from 'next/server';
import {requireUser} from '@/lib/auth-server';
import {adminDb} from '@/lib/admin';
import {getPlan,PLANS} from '@/lib/plans';
export async function GET(req:NextRequest){
 try{const u=await requireUser(req),db=adminDb(),user=(await db.collection('users').doc(u.uid).get()).data()||{},plan=getPlan(user.plan),month=new Date().toISOString().slice(0,7),usage=(await db.collection('usage').doc(`${u.uid}_${month}`).get()).data()||{};
 return NextResponse.json({plan,limits:{changes:PLANS[plan].monthlyChanges,generations:PLANS[plan].monthlyGenerations,referenceImages:PLANS[plan].referenceImages},used:{changes:usage.changes||0,generations:usage.generations||0},month});}
 catch(e:any){return NextResponse.json({error:e.message},{status:401});}
}
