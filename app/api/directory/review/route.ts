import { db, owner, respond, Failure } from "@/lib/directory/server";
import { revalidatePath } from "next/cache";
import { listingPath } from "@/lib/directory/profile";
export const dynamic = "force-dynamic";
async function reviewer(req: Request) {
  if ((await owner(req)).app_metadata.directory_admin !== true)
    throw new Failure(403, "Reviewer access required.");
}
export function GET(req: Request) {
  return respond(async () => {
    await reviewer(req);
    const { data, error } = await db()
      .from("directory_entries")
      .select("id,draft,revision")
      .is("deletion_due_at", null)
      .eq("status", "review");
    if (error) throw error;
    return data;
  });
}
export function POST(req: Request) {
  return respond(async () => {
    await reviewer(req);
    const { id, revision, status, note } = await req.json();
    if (
      !["published", "changes", "declined"].includes(status) ||
      typeof note !== "string" ||
      note.length > 1500
    )
      throw new Failure(400, "Invalid review.");
    const table = db().from("directory_entries");
    const { data } = await table
      .select("draft,profile_slug")
      .eq("id", id)
      .eq("revision", revision)
      .is("deletion_due_at", null)
      .eq("status", "review")
      .single();
    if (!data) throw new Failure(409, "Refresh the review queue.");
    const result = await table
      .update({
        status,
        review_note: note,
        ...(status === "published" ? { published: data.draft } : {}),
      })
      .eq("id", id)
      .eq("revision", revision)
      .is("deletion_due_at", null)
      .eq("status", "review")
      .select("id,profile_slug")
      .maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) throw new Failure(409, "Refresh the review queue.");
    if (status === "published") {
      if (data.profile_slug) revalidatePath(listingPath(data.profile_slug));
      revalidatePath(listingPath(result.data.profile_slug));
      revalidatePath("/directory");
      revalidatePath("/sitemap.xml");
    }
    return { ok: true };
  });
}
