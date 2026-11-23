import { subscribeEmail } from "@/lib/newsletter";
import { createHash } from "node:crypto";
import { owner, human, respond, Failure, db } from "@/lib/directory/server";
import { safeUrl } from "@/lib/publication";
import { easternInstant, validDay, shift } from "@/lib/event-time";
import { cities } from "@/lib/gwinnett";
import { eventStore } from "@/lib/community-event-store";
import { notifySubmission } from "@/lib/submission-alerts";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  return respond(async () => {
    const user = await owner(req);
    const events = await eventStore().fetch(
      `*[_type == "communityEventOwner" && ownerId == $ownerId]{
        "published": *[_id == ^.eventId][0]{title, "slug": slug.current},
        "draft": *[_id == "drafts." + ^.eventId][0]{title, reviewStatus},
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
    const sessions: { _key:string; _type:string; startsAt:string; endsAt?:string }[] = [];
    if (body.schedule === "selected") {
      if (until || !Array.isArray(body.selectedDates) || !body.selectedDates.length)
        throw new Failure(400, "Add another date or choose One date.");
      const days = new Set([day]);
      for (const row of body.selectedDates) {
        const start = typeof row?.start === "string" && easternInstant(row.start);
        const end = row?.end ? easternInstant(row.end) : null;
        if (!start || Date.parse(start) < Date.now() || (row.end && (!end || end <= start)))
          throw new Failure(400, "Check the start and end of each selected date.");
        const date = row.start.slice(0, 10);
        if (days.has(date) || date < day) throw new Failure(400, "Enter the earliest date first and each additional day only once.");
        days.add(date);
        sessions.push({_type:"eventSession", _key:date, startsAt:start, ...(end ? {endsAt:end} : {})});
      }
      sessions.sort((a,b) => a.startsAt.localeCompare(b.startsAt));
    }
    const registrationRequired = body.registrationRequired;
    const ticketUrl = registrationRequired ? safeUrl(field("ticketUrl", 1000)) : null;
    if (registrationRequired && !ticketUrl) throw new Failure(400, "Enter a valid registration link.");
    const url = body.url ? safeUrl(field("url", 1000)) : null,
      cost = field("cost");
    if (
      (body.url && !url) ||
      !cities.includes(city) ||
      !["free", "paid"].includes(cost)
    )
      throw new Failure(400, "Check city, cost, and website.");
    const price =
      cost === "paid" && body.price != null && body.price !== "" ? Number(body.price) : undefined;
    if (price !== undefined && (!Number.isFinite(price) || price <= 0))
      throw new Failure(400, "Enter a positive ticket price.");
    const unit = cost === "paid" && body.priceUnit ? field("priceUnit") : "";
    if (unit && !["person","vehicle"].includes(unit)) throw new Failure(400, "Choose a valid pricing unit.");
    const pricingDetails = cost === "paid" && body.pricingDetails?.trim() ? field("pricingDetails",600) : "";
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
    if(body.directoryEntry) {
      const match=await db().from("directory_entries").select("id").eq("owner_id",user.id).eq("id",body.directoryEntry).gt("premium_until",new Date().toISOString()).is("deletion_due_at",null).maybeSingle();
      if(match.error || !match.data) throw new Failure(400,"Choose a paid listing from your account.");
    }
    const store = eventStore();
    const ownerId = "ownership." + digest;
    const alertId = "drafts.review-alert-" + digest;
    try {
      await store.transaction().create({
        _id: ownerId,
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
        ...(body.directoryEntry ? {directoryEntry:body.directoryEntry} : {}),
        startsAt,
        ...(endsAt ? { endsAt } : {}),
        ...(until ? { weeklyUntil: until } : {}),
        ...(sessions.length ? {additionalSessions:sessions} : {}),
        ...(typeof registrationRequired === "boolean" ? {registrationRequired} : {}),
        ...(ticketUrl ? {ticketUrl} : {}),
        ...(pricingDetails ? {pricingDetails} : {}),
        cost,
        ...(price !== undefined ? { price } : {}),
        priceLabel:
          cost === "free" ? "Free" : price === undefined ? "Paid" : unit ? `From ${price} per ${unit}` : "$" + price,
        ...(url ? { url } : {}),
      }).create({
        _id: alertId, _type: "communitySubmissionAlert", title,
      }).commit();
    } catch (error) {
      // A replay must never recreate a reviewed draft or a delivered alert.
      if ((error as { statusCode?: number }).statusCode !== 409 || !await store.getDocument(ownerId)) throw error;
    }
    if (body.newsletter === "yes") await subscribeEmail(user.email!, "event");
    await notifySubmission("event", alertId);
    return { ok: true };
  });
}
