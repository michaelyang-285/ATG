import { subscribeEmail } from "@/lib/newsletter";
import { canReviewDeletions } from "@/lib/directory/deletion-review";
import { db, owner, human, respond, Failure } from "@/lib/directory/server";
import { listing } from "@/lib/directory/validate";
import { listingPath } from "@/lib/directory/profile";
import { revalidatePath } from "next/cache";
export const dynamic = "force-dynamic";
export function GET(req: Request) {
  return respond(async () => {
    const user = await owner(req);
    const { data, error } = await db()
      .from("directory_entries")
      .select("id,contact,draft,status,revision,review_note,deletion_due_at,profile_slug,published_name:published->>name")
      .eq("owner_id", user.id)
      .order("id");
    if (error) throw error;
    const progress=await db().from("directory_progress").select("listing_id,fields,step").eq("owner_id",user.id).order("updated_at",{ascending:false});
    if(progress.error)throw progress.error;
    return {canOpenQueue: canReviewDeletions(user), progress:progress.data,
      rows: data.map(({published_name, profile_slug, ...row}) => ({
        ...row,
        profilePath: published_name && profile_slug && !row.deletion_due_at ? listingPath(profile_slug) : null,
      })),
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
          .select("id,profile_slug")
          .maybeSingle()
      : await table
          .insert({ ...values, ...(body.listingId?{id:body.listingId}:{}),owner_id: user.id })
          .select("id,profile_slug")
          .single();
    if (result.error) throw result.error;
    if (!result.data)
      throw new Failure(409, "This listing changed. Reload before editing.");
    if (!body.id && body.newsletter === true) await subscribeEmail(user.email!, "directory");
    if(body.listingId)await db().from("directory_progress").delete().eq("owner_id",user.id).eq("listing_id",body.listingId);
    if (result.data.profile_slug) revalidatePath(listingPath(result.data.profile_slug));
    revalidatePath("/directory");
    return {id: result.data.id};
  });
}
