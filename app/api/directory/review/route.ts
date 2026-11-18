import { db, owner, respond, Failure } from "@/lib/directory/server";
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
      .select("draft")
      .eq("id", id)
      .eq("revision", revision)
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
      .eq("status", "review")
      .select("id")
      .maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) throw new Failure(409, "Refresh the review queue.");
    return { ok: true };
  });
}
