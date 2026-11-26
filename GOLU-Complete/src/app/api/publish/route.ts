import {NextRequest,NextResponse} from 'next/server';
import {requireUser} from '@/lib/auth-server';
import {adminDb,FieldValue} from '@/lib/admin';
export async function POST(req:NextRequest){
 try{
  const u=await requireUser(req),{projectId}=await req.json(),db=adminDb(),ref=db.collection('projects').doc(projectId),snap=await ref.get();
  if(!snap.exists||snap.data()?.uid!==u.uid)return NextResponse.json({error:'Project not found.'},{status:404});
  if(!process.env.DEPLOY_PROVIDER||!process.env.DEPLOY_API_TOKEN)return NextResponse.json({error:'Managed publishing is not connected yet. Configure a deployment provider, token and team ID on the server.'},{status:501});
  return NextResponse.json({error:'Deployment provider adapter is not implemented for this account yet. No site was published.'},{status:501});
 }catch(e:any){return NextResponse.json({error:e.message},{status:400});}
}
