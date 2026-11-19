import { canReviewDeletions } from "@/lib/directory/deletion-review";
import { revalidatePath } from "next/cache";
import { listingPath } from "@/lib/directory/profile";
import { db, Failure, human, owner, respond } from "@/lib/directory/server";

export function POST(req: Request) {
  return respond(async () => {
    await human();
    const user = await owner(req);
    const { id, action } = await req.json();
    if (typeof id !== "string" || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(id))
      throw new Failure(400, "Choose a listing.");
    const table = db().from("directory_entries");
    const now = new Date();
    let query;
    if (action === "request") {
      const due = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      query = table.update({ deletion_due_at: due.toISOString() })
        .eq("owner_id", user.id).is("deletion_due_at", null);
    } else if (action === "cancel") {
      query = table.update({ deletion_due_at: null })
        .eq("owner_id", user.id).gt("deletion_due_at", now.toISOString());
    } else if (action === "approve") {
      if (!canReviewDeletions(user)) throw new Failure(403, "Reviewer access required.");
      query = table.delete().not("deletion_due_at", "is", null);
    } else {
      throw new Failure(400, "Choose a valid action.");
    }
    const { data, error } = await query.eq("id", id).select("id,profile_slug").maybeSingle();
    if (error) throw error;
    if (!data) throw new Failure(409, "The listing or request has changed. Refresh your dashboard.");
    revalidatePath("/directory/local-" + id);
    if (data.profile_slug) revalidatePath(listingPath(data.profile_slug));
    revalidatePath("/directory");
    revalidatePath("/sitemap.xml");
    return { ok: true };
  });
}
