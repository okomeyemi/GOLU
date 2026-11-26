import {userFrom,json} from './_shared.mjs';
export default async event=>{try{await userFrom(event);return json(501,{error:'Managed publishing provider is not connected yet. No site was published.'});}catch(e){return json(e.statusCode||401,{error:e.message});}};
