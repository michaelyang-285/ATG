import Stripe from "stripe";
import { db, owner, human, respond, Failure } from "@/lib/directory/server";
export function POST(req: Request) {
  return respond(async () => {
    await human();
    const user = await owner(req),
      { id } = await req.json(),
      table = db().from("directory_entries");
    const { data, error } = await table
      .select("id,paid_session,checkout_session,checkout_attempt")
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();
    if (error || !data) throw new Failure(404, "Listing unavailable.");
    if (data.paid_session)
      throw new Failure(409, "This listing is already paid.");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!),
      home = new URL("/directory/manage", process.env.DIRECTORY_SITE_URL!).href;
    let attempt = data.checkout_attempt;
    if (data.checkout_session) {
      const prior = await stripe.checkout.sessions.retrieve(
        data.checkout_session,
      );
      if (prior.status === "open" && prior.url) return { url: prior.url };
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
        allowed_payment_method_types: ["card"],
        client_reference_id: id,
        metadata: { directory_entry: id },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: 300,
              product_data: { name: "All Things Gwinnett directory listing" },
            },
          },
        ],
        success_url: home + "?payment=returned",
        cancel_url: home,
      },
      { idempotencyKey: "directory-" + id + "-" + attempt },
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
