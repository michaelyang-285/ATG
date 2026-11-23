import {activeDeal} from "./deal";
import type { DayHours } from "./hours";
import {networks,type SocialFields} from "./social";
import {cache} from "react";
import {publication, type Business, imageUrl, safeUrl} from "@/lib/publication";
import {directoryPublic} from "./public";
import {categories} from "./categories";

type Listing = Business & SocialFields & {
  source?: "local";
  weeklyHours?: DayHours[]; hours?: string; publicPhone?: string;
  booking?: string; social?: string; gallery?: string[];
};
export const getListing = cache(async (slug: string): Promise<Listing | null> => {
  const legacy = /^local-([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})$/i.exec(slug);
  const [local] = await directoryPublic(legacy ? {id: legacy[1]} : {path: slug});
  if (local) return {...local, source: "local"};
  if (legacy) return null;
  return publication.fetch('*[_type=="business" && slug.current==$slug][0]{_id,name,"slug":slug.current,category,neighborhood,summary,address,url,image}', {slug}, {next:{revalidate:60}});
});
const types: Record<string,string> = {
  Coffee:"CafeOrCoffeeShop", "Cafés":"CafeOrCoffeeShop", Restaurants:"Restaurant", Bakers:"Bakery",
  "Hair Salons":"HairSalon", Barbers:"HairSalon", Nails:"NailSalon", Mechanics:"AutoRepair",
  Churches:"Church", Mosques:"Mosque", Synagogues:"Synagogue", Temples:"PlaceOfWorship",
  "Other Faith Communities":"ReligiousOrganization", Nonprofits:"Organization", Libraries:"Library",
  Plumbing:"Plumber", Electrical:"Electrician", Dentists:"Dentist", Veterinarians:"VeterinaryCare"
};
export const listingPath = (slug:string) => "/directory/" + encodeURIComponent(slug);
export const listingPhoto = (b:Listing) => safeUrl(b.logo) || imageUrl(b.image) || safeUrl(b.gallery?.[0]);
export function listingSchema(b:Listing) {
  const url = "https://allthingsgwinnett.com" + listingPath(b.slug);
  const offer=b.premium ? activeDeal(b.deal) : null;
  const photos=b.premium ? Array.from(new Set([listingPhoto(b),...(b.gallery || []).map(safeUrl)].filter(Boolean))) : [];
  const category = b.category || "";
  const type = types[category] || (categories.Community.includes(category) ? "Organization" :
    categories["Beauty & Personal Care"].includes(category) ? "HealthAndBeautyBusiness" : "LocalBusiness");
  const areas = b.neighborhood?.split(",").map(v=>v.trim()).filter(Boolean);
  return {"@context":"https://schema.org","@type":"WebPage","@id":url,url,name:b.name,
    mainEntity:{"@type":type,"@id":url+"#listing",name:b.name,description:b.summary||undefined,
      url:safeUrl(b.url)||url,image:photos.length ? photos : listingPhoto(b)||undefined,logo:safeUrl(b.logo)||undefined,
      ...(offer ? {makesOffer:{"@type":"Offer",name:offer.title,description:offer.terms,validThrough:offer.end,url}} : {}),
      telephone:b.publicPhone||undefined,address:b.address||undefined,
      areaServed:["Church","Mosque","Synagogue","PlaceOfWorship"].includes(type)?undefined:areas,
      sameAs:Array.from(new Set([...networks.map(n=>safeUrl(b[n.key])),safeUrl(b.social)].filter(Boolean)))}};
}
