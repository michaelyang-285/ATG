import {getBranchIndex} from "./branch-records";
import {branchName, resolveBranch} from "./branch";
import {activeDeal} from "./deal";
import {hoursError,type DayHours} from "./hours";
import {networks,type SocialFields} from "./social";
import {cache} from "react";
import {publication, BUSINESS_FIELDS, type Business, imageUrl, safeUrl} from "@/lib/publication";
import {directoryPublic} from "./public";
import {groupFor,groupUrl,landings} from "./browse-groups";
import highlights from "./share-highlights.json";
import {categories} from "./categories";

type Listing = Business & SocialFields & {
  source?: "local";
  weeklyHours?: DayHours[]; hours?: string; publicPhone?: string;
  booking?: string; social?: string; gallery?: string[];
};
export const getListing = cache(async (slug: string): Promise<Listing | null> => {
  const legacy = /^local-([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})$/i.exec(slug);
  const [local] = await directoryPublic(legacy ? {id: legacy[1]} : {path: slug});
  const listing: Listing | null = local ? {...local, source: "local"} : legacy ? null :
    await publication.fetch(`*[_type=="business" && slug.current==$slug][0]{${BUSINESS_FIELDS}}`, {slug}, {next:{revalidate:60}});
  if (!listing) return null;
  const {branch} = resolveBranch(listing, await getBranchIndex(listing.name));
  const editorialPhone = !local && listing.summary?.match(/\bCall\s+((?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4})\b/i)?.[1];
  return {...listing, branch, publicPhone:listing.publicPhone || editorialPhone || undefined};
});
const types: Record<string,string> = {
  "Grocery Stores & Supermarkets":"GroceryStore", Caterers:"FoodEstablishment", "Tires":"TireShop",
  HVAC:"HVACBusiness", "Hair Stylists":"HairSalon", "Auto":"AutomotiveBusiness",
  Coffee:"CafeOrCoffeeShop", "Cafés":"CafeOrCoffeeShop", Restaurants:"Restaurant", Bakers:"Bakery",
  "Hair Salons":"HairSalon", Barbers:"HairSalon", Nails:"NailSalon", Mechanics:"AutoRepair",
  Churches:"Church", Mosques:"Mosque", Synagogues:"Synagogue", Temples:"PlaceOfWorship",
  "Other Faith Communities":"ReligiousOrganization", Nonprofits:"Organization", Libraries:"Library",
  Plumbing:"Plumber", Electrical:"Electrician", Dentists:"Dentist", Veterinarians:"VeterinaryCare"
};
export const listingPath = (slug:string) => "/directory/" + encodeURIComponent(slug);
export const listingPhoto = (b:Listing) => safeUrl(b.logo) || imageUrl(b.image) || safeUrl(b.gallery?.[0]);
export function listingCrumbs(b:Listing) {
  const family = b.category && groupFor(b.category);
  const links = [{name:"Directory", path:"/directory"}];
  if (family && Object.values(landings).some(c=>c.name===family)) links.push({name:family,path:groupUrl(family)});
  return [...links,{name:branchName(b),path:listingPath(b.slug)}];
}
function postalAddress(value?:string) {
  if (!value?.trim()) return undefined;
  const parts=value.trim().match(/^(.+),\s*([^,]+),\s*(GA|Georgia)(?:[ ,]+(\d{5}(?:-\d{4})?))?(?:,\s*(?:USA|United States))?$/i);
  return parts ? {"@type":"PostalAddress",streetAddress:parts[1].trim(),addressLocality:parts[2].trim(),
    addressRegion:"GA",postalCode:parts[4],addressCountry:"US"} : value.trim();
}
function editorialType(b:Listing) {
  if (b.category !== "Food") return undefined;
  const entry = (highlights as Record<string,{style:string; evidence?:string}>)[b.slug];
  if (entry && (!entry.evidence || b.summary?.toLowerCase().includes(entry.evidence.toLowerCase()))) {
    if (entry.style==="Bakers") return "Bakery";
    if (["Restaurants","Buffet","Korean barbecue","Chinese restaurant","Steakhouse","Noodle shop","Diner","Bistro","Tavern","Dim sum"].includes(entry.style)) return "Restaurant";
  }
  if (/\b(?:taquer[ií]a|restaurant)\b/i.test(b.name)) return "Restaurant";
  return "FoodEstablishment";
}
export function listingSchema(b:Listing) {
  const url = "https://allthingsgwinnett.com" + listingPath(b.slug);
  const offer=b.premium ? activeDeal(b.deal) : null;
  const photos=b.premium ? Array.from(new Set([listingPhoto(b),...(b.gallery || []).map(safeUrl)].filter(Boolean))) : [];
  const category = b.category || "";
  const type = types[category] || editorialType(b) || (categories.Community.includes(category) ? "Organization" :
    categories["Beauty & Personal Care"].includes(category) ? "HealthAndBeautyBusiness" : "LocalBusiness");
  const week = b.weeklyHours && !hoursError(b.weeklyHours) ? b.weeklyHours : undefined;
  const areas = b.neighborhood?.split(",").map(v=>v.trim()).filter(Boolean);
  return {"@context":"https://schema.org","@type":"WebPage","@id":url,url,name:branchName(b),
    breadcrumb:{"@type":"BreadcrumbList",itemListElement:listingCrumbs(b).map((c,i)=>({"@type":"ListItem",position:i+1,name:c.name,item:"https://allthingsgwinnett.com"+c.path}))},
    mainEntity:{"@type":type,"@id":url+"#listing",name:b.name,description:b.summary||undefined,
      url:safeUrl(b.url)||url,image:photos.length ? photos : listingPhoto(b)||undefined,logo:safeUrl(b.logo)||undefined,
      ...(offer ? {makesOffer:{"@type":"Offer",name:offer.title,description:offer.terms,validThrough:offer.noEnd ? undefined : offer.end,url}} : {}),
      telephone:b.publicPhone||undefined,address:postalAddress(b.address),
      openingHoursSpecification:week?.map(row=>({"@type":"OpeningHoursSpecification",dayOfWeek:"https://schema.org/"+row.day,opens:row.open?row.opens:"00:00",closes:row.open?row.closes:"00:00"})),
      areaServed:["Church","Mosque","Synagogue","PlaceOfWorship"].includes(type)?undefined:areas,
      sameAs:Array.from(new Set([...networks.map(n=>safeUrl(b[n.key])),safeUrl(b.social)].filter(Boolean)))}};
}
