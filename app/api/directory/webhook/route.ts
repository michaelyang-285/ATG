import { notifySubmission } from "@/lib/submission-alerts";
import Stripe from "stripe";
import { db, respond, Failure } from "@/lib/directory/server";
export function POST(req: Request) {
  return respond(async () => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        await req.text(),
        req.headers.get("stripe-signature") || "",
        process.env.STRIPE_DIRECTORY_WEBHOOK_SECRET!,
      );
    } catch {
      throw new Failure(400, "Invalid signature.");
    }
    if (event.type === "checkout.session.completed") {
      const s = event.data.object,
        id = s.metadata?.directory_entry;
      if (
        id &&
        id === s.client_reference_id &&
        s.mode === "payment" &&
        (s.payment_status === "paid" || (s.amount_total === 0 && s.payment_status === "no_payment_required")) &&
        s.currency === "usd" &&
        s.amount_subtotal === 300 && s.amount_total !== null &&
        s.amount_total >= 0 && s.amount_total === 300 - (s.total_details?.amount_discount ?? 0)
      ) {
        const { error } = await db()
          .from("directory_entries")
          .update({ status: "review", paid_session: s.id })
          .eq("id", id)
          .is("paid_session", null);
        if (error) throw error;
        await notifySubmission("profile", id);
      }
    }
    const object = event.data.object;
    let subscriptionId: string | null = null;
    if (event.type==="checkout.session.completed" && object.object==="checkout.session" && typeof object.subscription==="string") subscriptionId=object.subscription;
    if (event.type.startsWith("customer.subscription.") && object.object==="subscription") subscriptionId=object.id;
    if (event.type==="invoice.paid" && object.object==="invoice") {
      const sub=object.parent?.subscription_details?.subscription;
      if(typeof sub==="string") subscriptionId=sub;
    }
    if(subscriptionId) {
      const sub=await stripe.subscriptions.retrieve(subscriptionId,{expand:["latest_invoice"]});
      const item=sub.items.data.find(i=>sub.metadata.plan==="atg_annual" && i.price.currency==="usd" && (i.price.unit_amount===1200 || i.price.unit_amount===900) && i.price.recurring?.interval==="year");
      const id=sub.metadata.directory_entry;
      if(item && id) {
        const table=db().from("directory_entries");
        const ended=["canceled","incomplete_expired","unpaid"].includes(sub.status);
        if(ended) {
          const cleared=await table.update({subscription_id:null,billing_customer:null,premium_until:null,checkout_session:null}).eq("id",id).eq("subscription_id",sub.id);
          if(cleared.error) throw cleared.error;
        } else if(sub.status==="active" && typeof sub.latest_invoice==="object" && sub.latest_invoice?.status==="paid") {
          const saved=await table.update({subscription_id:sub.id,billing_customer:sub.customer,premium_until:new Date(item.current_period_end*1000).toISOString()}).eq("id",id).or("subscription_id.is.null,subscription_id.eq."+sub.id);
          if(saved.error) throw saved.error;
          const queued=await table.update({status:"review"}).eq("id",id).eq("subscription_id",sub.id).eq("status","unpaid").eq("contact->>tier","paid").is("contact->>onboarding",null).select("id").maybeSingle();
          if(queued.error) throw queued.error;
          if(queued.data) await notifySubmission("profile",id);
        }
      }
    }
    return { ok: true };
  });
}
