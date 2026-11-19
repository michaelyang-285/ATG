import { canReviewDeletions } from "@/lib/directory/deletion-review";
import { db, Failure, owner, respond } from "@/lib/directory/server";
import { eventStore } from "@/lib/community-event-store";
import { safeUrl } from "@/lib/publication";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return respond(async () => {
    const user = await owner(request);
    if (!canReviewDeletions(user)) throw new Failure(403, "Reviewer access required.");
    const moderator = user.app_metadata.directory_admin === true;
    const deletions = db().from("directory_entries").select("id,name:draft->>name,deletion_due_at")
      .not("deletion_due_at", "is", null).order("deletion_due_at");
    const events = moderator ? eventStore().fetch(
      `*[_type == "communityEventOwner"]{
        "published": *[_id == ^.eventId][0]._id,
        "draft": *[_type == "event" && _id == "drafts." + ^.eventId && coalesce(reviewStatus, "pending") != "rejected"][0]{
          _id, _rev, title, summary, startsAt, endsAt, weeklyUntil, venue, street, city,
          organizer, priceLabel, url, ticketUrl
        }
      }[!defined(published) && defined(draft)].draft | order(startsAt asc)`,
      {}, { cache: "no-store" }
    ).then(rows => rows.map(row => ({ ...row, url: safeUrl(row.url), ticketUrl: safeUrl(row.ticketUrl) })))
      .catch(() => null) : [];
    const [removals, drafts] = await Promise.all([deletions, events]);
    return { moderator, deletions: removals.error ? null : removals.data, events: drafts };
  });
}
