import { db, human, owner, respond, Failure } from "@/lib/directory/server";
export function POST(req:Request){return respond(async()=>{
  await human();const user=await owner(req);const {listingId,step,fields}=await req.json();
  if(!/^[a-f0-9]{8}-[a-f0-9-]{27}$/.test(listingId)||!Number.isInteger(step)||step<0||step>4||!fields||typeof fields!=="object"||Array.isArray(fields)||JSON.stringify(fields).length>20000)throw new Failure(400,"Check your listing details.");
  if (fields.id) {
    const existing = await db().from("directory_entries").select("id").eq("id", listingId)
      .eq("owner_id", user.id).is("deletion_due_at", null).maybeSingle();
    if (existing.error) throw existing.error;
    if (fields.id !== listingId || !existing.data) throw new Failure(409, "This listing is no longer editable.");
  }
  const {error}=await db().from("directory_progress").upsert({owner_id:user.id,listing_id:listingId,step,fields,updated_at:new Date().toISOString()});
  if(error)throw error;return {ok:true};
})}
