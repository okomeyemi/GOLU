import {NextRequest,NextResponse} from 'next/server';
import {requireUser} from '@/lib/auth-server';
export async function POST(req:NextRequest){
 try{await requireUser(req);return NextResponse.json({error:'Billing provider is not configured. Connect a payment provider and set server-side credentials before accepting payments.'},{status:501});}
 catch(e:any){return NextResponse.json({error:e.message},{status:401});}
}
