import { canReviewDeletions } from "@/lib/directory/deletion-review";
import { db, owner, human, respond, Failure } from "@/lib/directory/server";
import { listing } from "@/lib/directory/validate";
import { revalidatePath } from "next/cache";
export const dynamic = "force-dynamic";
export function GET(req: Request) {
  return respond(async () => {
    const user = await owner(req);
    const { data, error } = await db()
      .from("directory_entries")
      .select("id,contact,draft,status,revision,review_note,deletion_due_at")
      .eq("owner_id", user.id)
      .order("id");
    if (error) throw error;
    const progress=await db().from("directory_progress").select("listing_id,fields,step").eq("owner_id",user.id).order("updated_at",{ascending:false});
    if(progress.error)throw progress.error;
    const removalQueue = canReviewDeletions(user)
      ? await db().from("directory_entries").select("id,name:draft->>name,deletion_due_at")
          .not("deletion_due_at", "is", null).order("deletion_due_at")
      : {data: [], error: null};
    if (removalQueue.error) throw removalQueue.error;
    return {deletions: removalQueue.data, progress:progress.data,
      rows: data,
      moderator: user.app_metadata.directory_admin === true,
    };
  });
}
export function POST(req: Request) {
  return respond(async () => {
    await human();
    const user = await owner(req),
      body = await req.json();
    const values = listing(body, user.email!, user.id),
      table = db().from("directory_entries");
    const result = body.id
      ? await table
          .update({
            ...values,
            revision: body.revision + 1,
            status: body.status === "unpaid" ? "unpaid" : "review",
            review_note: "",
          })
          .eq("owner_id", user.id)
          .eq("id", body.id)
          .is("deletion_due_at", null)
          .eq("revision", body.revision)
          .eq("status", body.status)
          .select("id")
          .maybeSingle()
      : await table
          .insert({ ...values, ...(body.listingId?{id:body.listingId}:{}),owner_id: user.id })
          .select("id")
          .single();
    if (result.error) throw result.error;
    if (!result.data)
      throw new Failure(409, "This listing changed. Reload before editing.");
    if(body.listingId)await db().from("directory_progress").delete().eq("owner_id",user.id).eq("listing_id",body.listingId);
    revalidatePath("/directory/local-" + result.data.id);
    revalidatePath("/directory");
    return result.data;
  });
}
