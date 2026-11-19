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
      }
    }
    return { ok: true };
  });
}
