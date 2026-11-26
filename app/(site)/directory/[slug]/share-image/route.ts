import {getListing} from "@/lib/directory/profile";
import {directoryCard} from "@/lib/directory/share";
import {directoryImage} from "@/lib/directory/share-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, {params}: {params:{slug:string}}) {
  const listing = await getListing(params.slug);
  if (!listing || listing.slug !== params.slug) {
    return new Response("Listing not found", {status:404, headers:{"Cache-Control":"no-store"}});
  }
  return directoryImage(directoryCard(listing));
}
