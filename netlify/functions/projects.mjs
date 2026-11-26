import {admin,userFrom,json} from './_shared.mjs';
export default async event=>{try{const u=await userFrom(event),s=await admin().db.collection('projects').where('uid','==',u.uid).get();const projects=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.updatedAt?._seconds||0)-(a.updatedAt?._seconds||0));return json(200,{projects});}catch(e){return json(e.statusCode||401,{error:e.message});}};
