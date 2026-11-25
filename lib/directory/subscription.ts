import type Stripe from "stripe";
import { db } from "@/lib/directory/server";
import { notifySubmission } from "@/lib/submission-alerts";

export async function syncDirectorySubscription(sub: Stripe.Subscription, checkout?: { id: string; listingId: string; ownerId: string }) {
  const id = sub.metadata.directory_entry;
  if (!id || sub.metadata.plan !== "atg_annual" || (checkout && checkout.listingId !== id)) return false;
  const item = sub.items.data.find(({ price }) =>
    price.currency === "usd" && (price.unit_amount === 1200 || price.unit_amount === 900) && price.recurring?.interval === "year"
  );
  if (!item) return false;

  const table = db().from("directory_entries");
  if (!checkout && ["canceled", "incomplete_expired", "unpaid"].includes(sub.status)) {
    const cleared = await table.update({
      subscription_id: null, billing_customer: null, premium_until: null, checkout_session: null,
    }).eq("id", id).eq("subscription_id", sub.id);
    if (cleared.error) throw cleared.error;
    return false;
  }
  if (sub.status !== "active" || typeof sub.latest_invoice !== "object" || sub.latest_invoice?.status !== "paid") return false;

  const paidUntil = new Date(item.current_period_end * 1000);
  if (paidUntil.getTime() <= Date.now()) return false;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  let update = table.update({
    subscription_id: sub.id, billing_customer: customerId, premium_until: paidUntil.toISOString(),
  }).eq("id", id).or("subscription_id.is.null,subscription_id.eq." + sub.id);
  if (checkout) update = update.eq("owner_id", checkout.ownerId).eq("checkout_session", checkout.id)
    .or("premium_until.is.null,premium_until.lte." + paidUntil.toISOString());
  const saved = await update.select("id").maybeSingle();
  if (saved.error) throw saved.error;
  if (!saved.data) return false;
  const queued = await table.update({ status: "review" }).eq("id", id).eq("subscription_id", sub.id)
    .eq("status", "unpaid").eq("contact->>tier", "paid").is("contact->>onboarding", null).select("id").maybeSingle();
  if (queued.error) throw queued.error;
  if (queued.data) await notifySubmission("profile", id);
  return true;
}
