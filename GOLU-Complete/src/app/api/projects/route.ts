import { NextRequest,NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-server';
import { adminDb } from '@/lib/admin';
export async function GET(req:NextRequest){
 try{const u=await requireUser(req);const snap=await adminDb().collection('projects').where('uid','==',u.uid).orderBy('updatedAt','desc').get();return NextResponse.json({projects:snap.docs.map(d=>({id:d.id,...d.data()}))});}
 catch(e:any){return NextResponse.json({error:e.message},{status:401});}
}
