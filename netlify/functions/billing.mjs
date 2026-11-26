import {userFrom,json} from './_shared.mjs';
export default async event=>{try{await userFrom(event);return json(501,{error:'OPay billing is not activated. Add merchant credentials and webhook configuration first.'});}catch(e){return json(e.statusCode||401,{error:e.message});}};
