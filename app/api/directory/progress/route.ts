import { db, human, owner, respond, Failure } from "@/lib/directory/server";
export function POST(req:Request){return respond(async()=>{
  await human();const user=await owner(req);const {listingId,step,fields}=await req.json();
  if(!/^[a-f0-9]{8}-[a-f0-9-]{27}$/.test(listingId)||!Number.isInteger(step)||step<0||step>4||!fields||typeof fields!=="object"||Array.isArray(fields)||JSON.stringify(fields).length>20000)throw new Failure(400,"Check your listing details.");
  const {error}=await db().from("directory_progress").upsert({owner_id:user.id,listing_id:listingId,step,fields,updated_at:new Date().toISOString()});
  if(error)throw error;return {ok:true};
})}
