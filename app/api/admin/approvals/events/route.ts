import { revalidatePath } from "next/cache";
import { eventStore } from "@/lib/community-event-store";
import { Failure, owner, respond } from "@/lib/directory/server";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return respond(async () => {
    const user = await owner(request);
    if (user.app_metadata.directory_admin !== true)
      throw new Failure(403, "Event reviewer access required.");

    const body = await request.json().catch(() => null);
    const { draftId, revision, decision } = body ?? {};
    const match = typeof draftId === "string" && /^drafts\.(community-event-([a-f0-9]{64}))$/.exec(draftId);
    if (!match || typeof revision !== "string" || !revision || !["approve", "reject"].includes(decision))
      throw new Failure(400, "Choose a pending event and a review decision.");

    const [, eventId, digest] = match;
    const store = eventStore();
    const [ownership, draft, published] = await store.getDocuments(["ownership." + digest, draftId, eventId]);
    if (ownership?._type !== "communityEventOwner" || ownership.eventId !== eventId)
      throw new Failure(404, "Event submission not found.");

    const changed = "This event has changed or was already reviewed. Refresh the queue to see its current status.";
    if (published || !draft || draft._type !== "event" || draft._rev !== revision || draft.reviewStatus === "rejected")
      throw new Failure(409, changed);

    try {
      if (decision === "approve") {
        await store.action({
          actionType: "sanity.action.document.publish", publishedId: eventId,
          draftId, ifDraftRevisionId: revision,
        });
      } else {
        await store.patch(draftId).ifRevisionId(revision).set({ reviewStatus: "rejected" }).commit();
      }
    } catch (error) {
      if ([404, 409].includes((error as { statusCode?: number }).statusCode))
        throw new Failure(409, changed);
      throw error;
    }
    if (decision === "approve") {
      revalidatePath("/events");
      revalidatePath("/events/" + encodeURIComponent(draft.slug?.current || eventId));
      revalidatePath("/sitemap.xml");
      revalidatePath("/");
    }
    return { ok: true };
  });
}
