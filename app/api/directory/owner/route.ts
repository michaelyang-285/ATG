import { notifySubmission } from "@/lib/submission-alerts";
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
      .select("id,premium_until,billing_customer,paid_session,contact,draft,status,revision,review_note,deletion_due_at,profile_slug,published_name:published->>name")
      .eq("owner_id", user.id)
      .order("id");
    if (error) throw error;
    const progress=await db().from("directory_progress").select("listing_id,fields,step").eq("owner_id",user.id).order("updated_at",{ascending:false});
    if(progress.error)throw progress.error;
    return {canOpenQueue: canReviewDeletions(user), progress:progress.data,
      rows: data.map(({published_name, profile_slug, paid_session, billing_customer, ...row}) => ({
        ...row, legacy: !!paid_session, billing: !!billing_customer,
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
    if (!user.email_confirmed_at) throw new Failure(403,"Verify your email before submitting a listing.");
    const current = body.id ? await table.select("paid_session,premium_until,status,contact").eq("id",body.id).eq("owner_id",user.id).single() : null;
    if (current?.error) throw new Failure(404,"Listing unavailable.");
    const premium = Date.parse(current?.data?.premium_until || "") > Date.now();
    const paidSignup=body.id ? current?.data?.status==="unpaid" && current.data.contact?.tier==="paid" : body.tier==="paid";
    Object.assign(values.contact,{tier:paidSignup ? "paid" : current?.data?.contact?.tier || "free",url:values.draft.url});
    if(!premium && !paidSignup && !current?.data?.paid_session) values.draft.url="";
    if (!paidSignup && !premium && !current?.data?.paid_session && (values.draft.gallery.length || [values.draft.url,values.draft.booking,values.draft.social].some(Boolean)))
      throw new Failure(400,"Upgrade before adding links or gallery photos.");
    if ((premium || paidSignup) && body.dealTitle?.trim()) {
      if (typeof body.dealTerms !== "string" || !body.dealTerms.trim() || body.dealTerms.length>500 || body.dealTitle.length>100 || !/^\d{4}-\d{2}-\d{2}$/.test(body.dealEnd)) throw new Failure(400,"Include the offer, redemption details and expiration date.");
      Object.assign(values.draft,{deal:{title:body.dealTitle.trim(),terms:body.dealTerms.trim(),end:body.dealEnd}});
    }
    const result = body.id
      ? await table
          .update({
            ...values,
            revision: body.revision + 1,
            status: paidSignup ? "unpaid" : "review",
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
          .insert({ ...values, ...(body.listingId?{id:body.listingId}:{}),owner_id: user.id, status:paidSignup ? "unpaid" : "review" })
          .select("id,profile_slug")
          .single();
    if (result.error?.code === "P0429") throw new Failure(429,"You can submit up to three new listings per day.");
    if (result.error?.code === "P0409") throw new Failure(409,"This business is already in your account. Edit its listing instead.");
    if (result.error) throw result.error;
    if (!result.data)
      throw new Failure(409, "This listing changed. Reload before editing.");
    if (!paidSignup && (!body.id || body.status==="unpaid")) await notifySubmission("profile",result.data.id);
    if (!body.id && body.newsletter === true) await subscribeEmail(user.email!, "directory");
    if(body.listingId)await db().from("directory_progress").delete().eq("owner_id",user.id).eq("listing_id",body.listingId);
    if (result.data.profile_slug) revalidatePath(listingPath(result.data.profile_slug));
    revalidatePath("/directory");
    return {id: result.data.id};
  });
}
