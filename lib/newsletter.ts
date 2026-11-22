import { db } from "@/lib/directory/server";

const publicationId = "pub_9f07c9f8-c3df-4f7c-8778-3a24d5a715ca";
type Source = "newsletter" | "event" | "directory";
async function deliver(email: string, source: string) {
  if (!process.env.BEEHIIV_API_KEY) return false;
  const response=await fetch("https://api.beehiiv.com/v2/publications/"+publicationId+"/subscriptions",{
    method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+process.env.BEEHIIV_API_KEY},
    body:JSON.stringify({email,utm_source:"allthingsgwinnett.com",utm_medium:source,reactivate_existing:false,send_welcome_email:true}),
    cache:"no-store",signal:AbortSignal.timeout(4000)
  });
  if (!response.ok) throw new Error("beehiiv delivery failed: "+response.status);
  const {error}=await db().from("newsletter_subscribers").update({beehiiv_synced_at:new Date().toISOString()}).eq("email",email);
  if (error) throw error;
  return true;
}
export async function subscribeEmail(address:string, source:Source="newsletter") {
  const email=address.trim().toLowerCase();
  const table=db().from("newsletter_subscribers");
  const {error}=await table.upsert({email,signup_source:source},{onConflict:"email",ignoreDuplicates:true});
  if (error) throw error;
  if (!process.env.BEEHIIV_API_KEY) return;
  const row=await table.select("signup_source,beehiiv_synced_at").eq("email",email).single();
  if (row.data && !row.data.beehiiv_synced_at) {
    try { await deliver(email,row.data.signup_source); } catch { console.warn("Newsletter delivery queued for retry"); }
  }
}
export async function retryNewsletter() {
  if (!process.env.BEEHIIV_API_KEY) return {configured:false};
  const {data,error}=await db().from("newsletter_subscribers").select("email,signup_source").is("beehiiv_synced_at",null).order("subscribed_at").limit(50);
  if (error) throw error;
  let delivered=0;
  for (const row of data) {
    try { if (await deliver(row.email,row.signup_source)) delivered++; } catch { /* Retain pending rows for the next run. */ }
  }
  return {configured:true,delivered};
}