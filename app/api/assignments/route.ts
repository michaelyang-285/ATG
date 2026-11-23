import { db, Failure, owner, respond } from "@/lib/directory/server";

export function GET(req: Request) {
  return respond(async () => {
    const user = await owner(req);
    if (!user.app_metadata.approved_author)
      throw new Failure(403, "Author approval required.");
    const rows = await db()
      .from("author_assignments")
      .select("*")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false });
    if (rows.error) throw rows.error;
    return rows.data;
  });
}
export function POST(req: Request) {
  return respond(async () => {
    const user = await owner(req);
    if (!user.app_metadata.approved_author)
      throw new Failure(403, "Author approval required.");
    const body = await req.json();
    const table = db().from("author_assignments");
    const { data: row, error } = await table
      .select("*")
      .eq("id", body.id)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!row || row.submitted || row.revision !== body.revision)
      throw new Failure(
        409,
        "Reload the assignment to see its latest version.",
      );
    const answers = { ...row.answers };
    if (body.submit !== true) {
      if (
        !Number.isInteger(body.index) ||
        body.index < 0 ||
        body.index >= row.questions.length ||
        typeof body.answer !== "string" ||
        body.answer.length > 30000
      )
        throw new Failure(400, "Check the answer.");
      answers[body.index] = body.answer.trim();
    }
    const saved = await table
      .update({
        answers,
        submitted: body.submit === true,
        revision: row.revision + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .eq("owner_id", user.id)
      .eq("revision", row.revision)
      .select()
      .maybeSingle();
    if (saved.error) throw saved.error;
    if (!saved.data)
      throw new Failure(409, "Assignment changed. Reload before editing.");
    return saved.data;
  });
}
