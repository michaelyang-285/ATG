import Stripe from "stripe";
import { db, owner, human, respond, Failure } from "@/lib/directory/server";

export function GET(req: Request) {
  return respond(async () => {
    const user = await owner(req);
    const { data, error } = await db()
      .from("directory_entries")
      .select("premium_until")
      .eq("owner_id", user.id)
      .eq("id", new URL(req.url).searchParams.get("id"))
      .single();
    if (error) throw new Failure(404, "Listing unavailable.");
    return { completed: Date.parse(data.premium_until) > Date.now() };
  });
}
export function POST(req: Request) {
  return respond(async () => {
    await human();
    const user = await owner(req),
      { id } = await req.json();
    const table = db().from("directory_entries");
    const { data, error } = await table
      .select(
        "id,published,billing_customer,subscription_id,checkout_attempt,checkout_session,deletion_due_at,status,contact",
      )
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();
    if (error || !data)
      throw new Failure(409, "Your listing must be approved before upgrading.");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const home = new URL("/account", process.env.DIRECTORY_SITE_URL!).href;
    if (data.subscription_id && data.billing_customer) {
      return stripe.billingPortal.sessions
        .create({
          customer: data.billing_customer,
          return_url: home,
          ...(process.env.STRIPE_SECRET_KEY?.includes("_live_")
            ? { configuration: "bpc_1UeyRNEFAD5SU8Kybse4wnD0" }
            : {}),
        })
        .then(({ url }) => ({ url }));
    }
    if ((!data.published && !(data.status==="unpaid" && data.contact?.tier==="paid")) || data.deletion_due_at)
      throw new Failure(
        409,
        "An approved, visible listing is required to upgrade.",
      );
    if (data.checkout_session?.startsWith(process.env.STRIPE_SECRET_KEY?.includes("_live_") ? "cs_live_" : "cs_test_")) {
      const prior = await stripe.checkout.sessions.retrieve(
        data.checkout_session,
      );
      if (prior.mode === "subscription" && prior.status === "open" && prior.amount_subtotal === 1200)
        return { url: prior.url };
      if (prior.mode === "subscription" && prior.status === "complete")
        throw new Failure(
          409,
          "Payment is processing. Refresh your account shortly.",
        );
      if (prior.status === "open")
        await stripe.checkout.sessions.expire(prior.id);
    }
    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: 1200,
              recurring: { interval: "year" },
              ...(process.env.STRIPE_SECRET_KEY?.includes("_live_")
                ? { product: "prod_atg_directory_profile" }
                : { product_data: { name: "ATG paid directory listing" } }),
            },
            quantity: 1,
          },
        ],
        client_reference_id: id,
        subscription_data: {
          metadata: { directory_entry: id, plan: "atg_annual" },
        },
        customer_email: user.email,
        success_url: home + "?payment=returned&listing=" + encodeURIComponent(id),
        cancel_url: home,
      },
      {
        idempotencyKey: "directory-annual-12-" + id + "-" + data.checkout_attempt,
      },
    );
    const saved = await table
      .update({
        checkout_session: session.id,
        checkout_attempt: data.checkout_attempt + 1,
      })
      .eq("id", id)
      .eq("checkout_attempt", data.checkout_attempt);
    if (saved.error) throw saved.error;
    return { url: session.url };
  });
}
