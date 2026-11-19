import Stripe from "stripe";
import { db, owner, human, respond, Failure } from "@/lib/directory/server";
import { eligibleLocation } from "@/lib/directory/business-location";
export function POST(req: Request) {
  return respond(async () => {
    await human();
    const user = await owner(req),
      { id } = await req.json(),
      table = db().from("directory_entries");
    const { data, error } = await table
      .select("id,paid_session,checkout_session,checkout_attempt,contact,deletion_due_at")
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();
    if (error || !data) throw new Failure(404, "Listing unavailable.");
    if (data.deletion_due_at) throw new Failure(409, "This listing is pending deletion.");
    if (!data.contact?.streetAddress || !eligibleLocation(data.contact.city, data.contact.zip))
      throw new Failure(409, "Edit your listing and complete the business address before checkout.");
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_DIRECTORY_WEBHOOK_SECRET)
      throw new Failure(503, "Your listing is saved. Payments are not open yet. Return to Manage listings when checkout opens.");
    if (data.paid_session)
      throw new Failure(409, "This listing is already paid.");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!),
      home = new URL("/directory/manage", process.env.DIRECTORY_SITE_URL!).href;
    let attempt = data.checkout_attempt;
    if (data.checkout_session) {
      const prior = await stripe.checkout.sessions.retrieve(
        data.checkout_session,
      );
      if (prior.status === "open" && prior.allow_promotion_codes && prior.url) return { url: prior.url };
      if (prior.status === "open") await stripe.checkout.sessions.expire(prior.id);
      if (prior.status === "complete")
        throw new Failure(
          409,
          "Payment is processing. Refresh your listing status shortly.",
        );
      const reset = await table
        .update({ checkout_session: null, checkout_attempt: attempt + 1 })
        .eq("id", id)
        .eq("checkout_attempt", attempt)
        .is("paid_session", null)
        .select("id")
        .maybeSingle();
      if (reset.error) throw reset.error;
      if (!reset.data) throw new Failure(409, "Checkout changed. Try again.");
      attempt++;
    }
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        allow_promotion_codes: true,
        allowed_payment_method_types: ["card"],
        client_reference_id: id,
        metadata: { directory_entry: id },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: 300,
              ...(process.env.STRIPE_SECRET_KEY!.includes("_live_")
                ? {product: "prod_atg_directory_profile"}
                : {product_data: {name: "All Things Gwinnett directory listing"}}),
            },
          },
        ],
        success_url: home + "?payment=returned",
        cancel_url: home,
      },
      { idempotencyKey: "directory-promo-v2-" + id + "-" + attempt },
    );
    const saved = await table
      .update({ checkout_session: session.id })
      .eq("id", id)
      .eq("checkout_attempt", attempt)
      .is("paid_session", null)
      .select("id")
      .maybeSingle();
    if (saved.error) throw saved.error;
    if (!saved.data || !session.url)
      throw new Failure(409, "Refresh your listing status.");
    return { url: session.url };
  });
}
