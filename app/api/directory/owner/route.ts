import { notifySubmission } from "@/lib/submission-alerts";
import { subscribeEmail } from "@/lib/newsletter";
import { canReviewDeletions } from "@/lib/directory/deletion-review";
import { db, owner, human, respond, Failure } from "@/lib/directory/server";
import {eligibleLocation, areaError} from "@/lib/directory/business-location";
import { directoryWebLink } from "@/lib/directory/web-link";
import { listing } from "@/lib/directory/validate";
import { listingPath } from "@/lib/directory/profile";
import { revalidatePath } from "next/cache";
export const dynamic = "force-dynamic";
const reviewStatuses = ["review", "published", "changes", "declined"];

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
    if (body.action === "reserve") {
      if (!user.email_confirmed_at) throw new Failure(403,"Confirm your email before checkout.");
      const {id, name, firstName, lastName, city, zip} = body;
      if (!/^[0-9a-f-]{36}$/i.test(id) || [name, firstName, lastName, city, zip].some(v => typeof v !== "string" || !v.trim() || v.length > 240) || name.trim().length > 100)
        throw new Failure(400,"Enter your name, business name, city and ZIP.");
      if (!eligibleLocation(city,zip)) throw new Failure(400,areaError);
      const table = db().from("directory_entries");
      const result = await table.insert({id, owner_id:user.id, status:"unpaid", draft:{name:name.trim()},
        contact:{tier:"paid", onboarding:true, firstName:firstName.trim(), lastName:lastName.trim(), email:user.email, city:city.trim(), zip:zip.trim()}});
      if (result.error) {
        const prior = await table.select("id").eq("owner_id",user.id).eq("id",id).eq("contact->>onboarding","true").maybeSingle();
        if (!prior.data) throw new Failure(409,"Check your saved listings before starting another checkout.");
      }
      return {id};
    }
    if (body.action === "saveDeal") {
      const table = db().from("directory_entries");
      const { data: row, error } = await table.select("draft,status,revision").is("contact->>onboarding",null)
        .eq("id", body.id).eq("owner_id", user.id).gt("premium_until", new Date().toISOString())
        .is("deletion_due_at", null).maybeSingle();
      if (error) throw error;
      if (!row) throw new Failure(403, "An active subscription is required for deals.");
      const draft = { ...row.draft };
      if (body.deal === null) delete draft.deal;
      else {
        const { title, terms, end } = body.deal || {};
        const noEnd = body.deal?.noEnd === true;
        if (typeof title !== "string" || !title.trim() || title.length > 100 ||
          typeof terms !== "string" || !terms.trim() || terms.length > 500 ||
          (!noEnd && (typeof end !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(end) ||
          !Number.isFinite(Date.parse(end)) || new Date(end).toISOString().slice(0,10) !== end)))
          throw new Failure(400, "Include an offer, redemption instructions and a valid last day.");
        const detail = (key: string, max: number) => {
          const value = body.deal[key] ?? "";
          if (typeof value !== "string" || value.length > max) throw new Failure(400,"Check the " + key + " field.");
          return value.trim();
        }
        const start = detail("start",10), description = detail("description",1500);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !Number.isFinite(Date.parse(start)) ||
          new Date(start).toISOString().slice(0,10) !== start || (!noEnd && start > end))
          throw new Failure(400,"Choose a valid start date on or before the end date.");
        if (!description) throw new Failure(400,"Add a description of your deal.");
        const image = detail("image",1000);
        const prefix = process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/directory-media/" + user.id + "/";
        if (image && !(image.startsWith(prefix) && /^[-a-f0-9]+\.(png|jpg|webp)$/.test(image.slice(prefix.length))))
          throw new Failure(400,"Upload a deal image from your account.");
        const link = directoryWebLink(detail("link",1000));
        if (link === null) throw new Failure(400,"Enter a valid deal link.");
        const channel = detail("channel",10);
        let destination = detail("destination",1000);
        if (!["","email","call","social"].includes(channel)) throw new Failure(400,"Choose a contact button.");
        if (channel === "call" && (!/^[+() .0-9-]+$/.test(destination) || !/^\d{7,15}$/.test(destination.replace(/\D/g,""))))
          throw new Failure(400,"Enter a valid contact phone number.");
        if (channel === "email" && !/^[^@\s?#%]+@[^@\s?#%]+\.[^@\s?#%]+$/.test(destination))
          throw new Failure(400,"Enter a valid contact email.");
        if (channel === "social") {
          destination = directoryWebLink(destination) || "";
          if (!destination) throw new Failure(400,"Enter a social profile or messaging link.");
        }
        draft.deal = {title:title.trim(), terms:terms.trim(), ...(noEnd ? {noEnd:true} : {end}), start, description, image, code:detail("code",80), link, channel, destination:channel ? destination : ""};
      }
      const saved = await table.update({draft, status:"review", revision:row.revision + 1, review_note:""})
        .eq("id",body.id).eq("owner_id",user.id).eq("revision",body.revision).eq("status",row.status)
        .gt("premium_until",new Date().toISOString()).is("deletion_due_at",null).select("id").maybeSingle();
      if (saved.error) throw saved.error;
      if (!saved.data) throw new Failure(409,"This listing changed. Refresh before editing the deal.");
      return {id: saved.data.id};
    }
    const values = listing(body, user.email!, user.id),
      table = db().from("directory_entries");
    if (!user.email_confirmed_at) throw new Failure(403,"Verify your email before submitting a listing.");
    if (body.id && (!Number.isSafeInteger(body.revision) || (body.status !== "unpaid" && !reviewStatuses.includes(body.status))))
      throw new Failure(400, "Reopen your listing from My account before submitting edits.");
    const current = body.id ? await table.select("paid_session,premium_until,status,contact,draft").eq("id",body.id).eq("owner_id",user.id).single() : null;
    if (current?.error) throw new Failure(404,"Listing unavailable.");
    const premium = Date.parse(current?.data?.premium_until || "") > Date.now();
    if (current?.data?.contact?.onboarding && !premium) throw new Failure(409,"Complete checkout before submitting this listing.");
    const paidSignup=!premium && (body.id ? current?.data?.status==="unpaid" && current.data.contact?.tier==="paid" : body.tier==="paid");
    Object.assign(values.contact,{tier:paidSignup ? "paid" : current?.data?.contact?.tier || "free",url:values.draft.url});
    if (!paidSignup && !premium && !current?.data?.paid_session && values.draft.gallery.length)
      throw new Failure(400,"Choose a paid listing to add gallery photos.");
    if (current?.data?.draft?.deal) Object.assign(values.draft, {deal: current.data.draft.deal});
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
          // A reviewer can decide this revision while its owner has an edit open.
          .in("status", body.status === "review" ? reviewStatuses : [body.status])
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
    if ((!body.id || current?.data?.contact?.onboarding) && body.newsletter === true) await subscribeEmail(user.email!, "directory");
    if(body.listingId)await db().from("directory_progress").delete().eq("owner_id",user.id).eq("listing_id",body.listingId);
    if (result.data.profile_slug) revalidatePath(listingPath(result.data.profile_slug));
    revalidatePath("/directory");
    return {id: result.data.id};
  });
}
