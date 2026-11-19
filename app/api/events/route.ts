import { createHash } from "node:crypto";
import { owner, human, respond, Failure, db } from "@/lib/directory/server";
import { publication, safeUrl } from "@/lib/publication";
import { easternInstant, validDay, shift } from "@/lib/event-time";
import { cities } from "@/lib/gwinnett";
function eventStore() {
  const token = process.env.SANITY_WRITE_TOKEN?.trim();
  if (!token) {
    console.error("Event storage token is missing");
    throw new Error("Event storage unavailable");
  }
  return publication.withConfig({ token, useCdn: false, perspective: "raw" });
}

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  return respond(async () => {
    const user = await owner(req);
    const events = await eventStore().fetch(
      `*[_type == "communityEventOwner" && ownerId == $ownerId]{
        "published": *[_id == ^.eventId][0]{title, "slug": slug.current},
        "draft": *[_id == "drafts." + ^.eventId][0]{title},
        eventId
      }[defined(published) || defined(draft)]`,
      { ownerId: user.id }, { cache: "no-store" }
    ).catch((error: unknown) => {
      const status = error && typeof error === "object" && "statusCode" in error ? error.statusCode : undefined;
      console.error("Unable to read owner events from Sanity", { status });
      throw error;
    });
    return { events };
  });
}

export function POST(req: Request) {
  return respond(async () => {
    await human();
    const user = await owner(req);
    const body = await req.json();
    function field(key: string, max = 240) {
      const value = body[key];
      if (typeof value !== "string" || !value.trim() || value.length > max)
        throw new Failure(400, "Check " + key + ".");
      return value.trim();
    }
    if (body.action === "profile") {
      const firstName = field("firstName"),
        lastName = field("lastName");
      const { error } = await db().auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, firstName, lastName },
      });
      if (error) throw error;
      return { ok: true };
    }
    const title = field("title"),
      summary = field("summary", 3000),
      venue = field("venue"),
      street = field("street"),
      city = field("city"),
      organizer = field("organizer");
    const startsAt = easternInstant(field("start")),
      endsAt = body.end ? easternInstant(field("end")) : null;
    if (
      !startsAt ||
      Date.parse(startsAt) < Date.now() ||
      (body.end && (!endsAt || endsAt <= startsAt))
    )
      throw new Failure(
        400,
        "Choose a future start and a valid end time (Eastern).",
      );
    const until = body.until || undefined,
      day = body.start.slice(0, 10);
    if (
      until &&
      (!validDay(until) || until < shift(day, 7) || until > shift(day, 365))
    )
      throw new Failure(
        400,
        "Weekly series must end within one year and include at least two dates.",
      );
    const url = body.url ? safeUrl(field("url", 1000)) : null,
      cost = field("cost");
    if (
      (body.url && !url) ||
      !cities.includes(city) ||
      !["free", "paid"].includes(cost)
    )
      throw new Failure(400, "Check city, cost, and website.");
    const price =
      cost === "paid" && body.price !== "" ? Number(body.price) : undefined;
    if (price !== undefined && (!Number.isFinite(price) || price <= 0))
      throw new Failure(400, "Enter a positive ticket price.");
    const id = field("requestId");
    if (!/^[a-f0-9-]{36}$/.test(id))
      throw new Failure(400, "Invalid submission.");
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 65) +
      "-" +
      id.slice(0, 8);
    const digest = createHash("sha256").update(user.id + ":" + id).digest("hex");
    const eventId = "community-event-" + digest;
    await eventStore().transaction().createIfNotExists({
      _id: "ownership." + digest,
      _type: "communityEventOwner",
      ownerId: user.id,
      eventId,
    }).createIfNotExists({
      _id: "drafts." + eventId,
      _type: "event",
      title,
      slug: { _type: "slug", current: slug },
      summary,
      venue,
      street,
      city,
      neighborhood: city,
      organizer,
      startsAt,
      ...(endsAt ? { endsAt } : {}),
      ...(until ? { weeklyUntil: until } : {}),
      cost,
      ...(price !== undefined ? { price } : {}),
      priceLabel:
        cost === "free" ? "Free" : price === undefined ? "Paid" : "$" + price,
      ...(url ? { url } : {}),
    }).commit();
    return { ok: true };
  });
}
