import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {requireUser} from '@/lib/auth-server';
import {adminDb,FieldValue} from '@/lib/admin';
const schema=z.object({displayName:z.string().min(2),businessName:z.string().optional(),phone:z.string().optional()});
export async function POST(req:NextRequest){
 try{const u=await requireUser(req),data=schema.parse(await req.json());await adminDb().collection('users').doc(u.uid).set({...data,email:u.email,plan:'basic',updatedAt:FieldValue.serverTimestamp()},{merge:true});return NextResponse.json({ok:true});}
 catch(e:any){return NextResponse.json({error:e.message},{status:400});}
}
