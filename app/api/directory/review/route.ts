import { db, owner, respond, Failure } from "@/lib/directory/server";
import { revalidatePath } from "next/cache";
import type { Business } from "@/lib/publication";
import { directoryPreview } from "@/lib/directory/share";
import { checkedDirectoryPng } from "@/lib/directory/share-image";
import { listingPath } from "@/lib/directory/profile";
export const dynamic = "force-dynamic";
async function reviewer(req: Request) {
  if ((await owner(req)).app_metadata.directory_admin !== true)
    throw new Failure(403, "Reviewer access required.");
}
// The database assigns the final slug on first publication or rename.
function previewDraft(id: string, row: {draft: Omit<Business, "_id" | "slug">; profile_slug?: string; publishedName?: string}) {
  const slug = row.publishedName === row.draft.name ? row.profile_slug || "" : "";
  return directoryPreview({...row.draft, _id: id, slug});
}

export function GET(req: Request) {
  return respond(async () => {
    await reviewer(req);
    const { data, error } = await db()
      .from("directory_entries")
      .select("id,draft,revision,profile_slug,publishedName:published->>name")
      .is("deletion_due_at", null)
      .eq("status", "review");
    if (error) throw error;
    return data.map(row => {
      const {card, ...copy} = previewDraft(row.id, row);
      return {id: row.id, draft: row.draft, revision: row.revision, preview: {...copy, card}};
    });
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
      .select("draft,profile_slug,publishedName:published->>name")
      .eq("id", id)
      .eq("revision", revision)
      .is("deletion_due_at", null)
      .eq("status", "review")
      .single();
    if (!data) throw new Failure(409, "Refresh the review queue.");
    if (status === "published") {
      const {card, ...copy} = previewDraft(id, data);
      if (!card.name || Object.values(copy).some(value => !value?.trim()))
        throw new Failure(422, "Review the business name and search and social copy before approving.");
      // Render the real card before committing the revision. Missing art or fonts must be retryable.
      try {
        await checkedDirectoryPng(card);
      } catch {
        throw new Failure(503, "The share image could not be verified. Please try again.");
      }
    }
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
