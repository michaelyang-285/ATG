import Stripe from "stripe";
import { canReviewDeletions } from "@/lib/directory/deletion-review";
import { revalidatePath } from "next/cache";
import { listingPath } from "@/lib/directory/profile";
import { db, Failure, human, owner, respond } from "@/lib/directory/server";

export function POST(req: Request) {
  return respond(async () => {
    await human();
    const user = await owner(req);
    const { id, action } = await req.json();
    if (typeof id !== "string" || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(id))
      throw new Failure(400, "Choose a listing.");
    const table = db().from("directory_entries");
    const now = new Date();
    let query;
    if (action === "request") {
      const existing=await table.select("subscription_id,checkout_session").eq("id",id).eq("owner_id",user.id).single();
      if(existing.error) throw new Failure(404,"Listing unavailable.");
      if(existing.data.subscription_id) {
        await new Stripe(process.env.STRIPE_SECRET_KEY!).subscriptions.update(existing.data.subscription_id,{cancel_at_period_end:true});
      } else if(existing.data.checkout_session?.startsWith(process.env.STRIPE_SECRET_KEY?.includes("_live_") ? "cs_live_" : "cs_test_")) {
        const stripe=new Stripe(process.env.STRIPE_SECRET_KEY!);
        const pending=await stripe.checkout.sessions.retrieve(existing.data.checkout_session);
        if(pending.status==="open") await stripe.checkout.sessions.expire(pending.id);
        else if(pending.mode==="subscription" && typeof pending.subscription==="string") await stripe.subscriptions.update(pending.subscription,{cancel_at_period_end:true});
      }
      const due = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      query = table.update({ deletion_due_at: due.toISOString() })
        .eq("owner_id", user.id).is("deletion_due_at", null);
    } else if (action === "cancel") {
      query = table.update({ deletion_due_at: null })
        .eq("owner_id", user.id).gt("deletion_due_at", now.toISOString());
    } else if (action === "approve") {
      if (!canReviewDeletions(user)) throw new Failure(403, "Reviewer access required.");
      query = table.delete().not("deletion_due_at", "is", null);
    } else {
      throw new Failure(400, "Choose a valid action.");
    }
    const { data, error } = await query.eq("id", id).select("id,profile_slug").maybeSingle();
    if (error) throw error;
    if (!data) throw new Failure(409, "The listing or request has changed. Refresh your dashboard.");
    revalidatePath("/directory/local-" + id);
    if (data.profile_slug) revalidatePath(listingPath(data.profile_slug));
    revalidatePath("/directory");
    revalidatePath("/sitemap.xml");
    return { ok: true };
  });
}
