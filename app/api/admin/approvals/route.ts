import { canReviewDeletions } from "@/lib/directory/deletion-review";
import { db, Failure, owner, respond } from "@/lib/directory/server";
import { eventStore } from "@/lib/community-event-store";
import { safeUrl } from "@/lib/publication";

export const dynamic = "force-dynamic";

const pendingEvents = `*[_type == "communityEventOwner"]{
  "published": *[_id == ^.eventId][0]._id,
  "draft": *[_type == "event" && _id == "drafts." + ^.eventId && coalesce(reviewStatus, "pending") != "rejected"][0]
}[!defined(published) && defined(draft)].draft`;

export function GET(request: Request) {
  return respond(async () => {
    const user = await owner(request);
    if (!canReviewDeletions(user)) throw new Failure(403, "Reviewer access required.");
    const moderator = user.app_metadata.directory_admin === true;
    const entries = db().from("directory_entries");

    if (new URL(request.url).searchParams.get("view") === "count") {
      const counts = entries.select("id", { count: "exact", head: true });
      // A profile awaiting deletion occupies one queue slot even if its status is also "review".
      const directoryCount = moderator ? counts.or("status.eq.review,deletion_due_at.not.is.null")
        : counts.not("deletion_due_at", "is", null);
      const [directory, events] = await Promise.all([
        directoryCount,
        moderator ? eventStore().fetch<number>(`count(${pendingEvents})`, {}, { cache: "no-store" }) : 0,
      ]);
      if (directory.error || directory.count == null || typeof events !== "number")
        throw new Failure(503, "The approval count is temporarily unavailable.");
      return { pending: directory.count + events };
    }

    const deletions = entries.select("id,name:draft->>name,deletion_due_at")
      .not("deletion_due_at", "is", null).order("deletion_due_at");
    const events = moderator ? eventStore().fetch(
      `${pendingEvents}{_id, _rev, title, summary, startsAt, endsAt, weeklyUntil, venue, street, city,
        organizer, priceLabel, url, ticketUrl} | order(startsAt asc)`,
      {}, { cache: "no-store" }
    ).then(rows => rows.map(row => ({ ...row, url: safeUrl(row.url), ticketUrl: safeUrl(row.ticketUrl) })))
      .catch(() => null) : [];
    const [removals, drafts] = await Promise.all([deletions, events]);
    return { moderator, deletions: removals.error ? null : removals.data, events: drafts };
  });
}
