import {accountAdmin} from "@/lib/account-admin";
import { db, human, owner, respond, Failure } from "@/lib/directory/server";
import { directoryImageType, storedImageLimit, thumbnailLimit } from "@/lib/directory/gallery";

async function imageData(part: FormDataEntryValue | null, limit: number) {
  if (!(part instanceof Blob) || !part.size || part.size > limit)
    throw new Failure(400, "The resized image is too large or empty. Please choose the photo again.");
  const bytes = Buffer.from(await part.arrayBuffer());
  const ext = directoryImageType(bytes);
  if (!ext) throw new Failure(400, "Choose a JPG, PNG, or WebP image.");
  return {bytes, ext, contentType: ext === "jpg" ? "image/jpeg" : "image/" + ext};
}

export function POST(req: Request) {
  return respond(async () => {
    await human();
    const user = await owner(req);
    if(!user.email_confirmed_at) throw new Failure(403,"Verify your email before uploading.");
    const quota=await db().rpc("reserve_directory_upload",{uid:user.id});
    if(quota.error) throw quota.error;
    if(!quota.data) throw new Failure(429,"Upload limit reached. Try again in an hour.");
    const data = await req.formData();
    if(data.has("thumbnail") && !data.has("listingId")){
      const listing=await db().from("directory_entries").select("paid_session,premium_until,status,contact").eq("id",data.get("galleryListing")).eq("owner_id",user.id).single();
      if(!(listing.data?.paid_session || Date.parse(listing.data?.premium_until)>Date.now() || (listing.data?.status==="unpaid" && listing.data.contact?.tier==="paid"))) {
        const draft=await db().from("directory_progress").select("fields").eq("listing_id",data.get("galleryListing")).eq("owner_id",user.id).maybeSingle();
        if(!draft.data || draft.data.fields?.id || draft.data.fields?.tier!=="paid") throw new Failure(403,"Choose a paid listing to add gallery photos.");
      }
    }
    const display = await imageData(data.get("file"), storedImageLimit);
    const preview = data.has("thumbnail") ? await imageData(data.get("thumbnail"), thumbnailLimit) : null;
    if (preview && preview.ext !== "jpg") throw new Failure(400, "The thumbnail must be a JPEG.");

    const bucket = db().storage.from("directory-media");
    let ownerId = user.id;
    if (data.has("listingId")) {
      if (!accountAdmin(user)) throw new Failure(403,"Administrator access required.");
      const listing = await db().from("directory_entries").select("owner_id").eq("id",data.get("listingId")).single();
      if (!listing.data) throw new Failure(404,"Listing unavailable.");
      ownerId = listing.data.owner_id;
    }
    const base = ownerId + "/" + crypto.randomUUID();
    const key = base + (preview ? ".gallery." : ".") + display.ext;
    const previewKey = base + ".thumb.jpg";
    if (preview) {
      const {error} = await bucket.upload(previewKey, preview.bytes, {contentType: preview.contentType});
      if (error) throw error;
    }
    try {
      const {error} = await bucket.upload(key, display.bytes, {contentType: display.contentType});
      if (error) throw error;
    } catch (error) {
      if (preview) await bucket.remove([previewKey]);
      throw error;
    }
    return {url: bucket.getPublicUrl(key).data.publicUrl};
  });
}
