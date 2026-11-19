import { formatServiceAreas, serviceAreaCities } from "./locations";
import { hoursError, validTime, type DayHours } from "./hours";
import { descriptionLimit, descriptionLength } from "./description";
import { eligibleLocation, areaError } from "./business-location";
import {networks} from "./social";
import { categories, services } from "./categories";
import { Failure } from "./server";
import { galleryLimit } from "./gallery";
export function listing(input: any, email: string, uid: string) {
  const invalid = (label: string) => {
    throw new Failure(400, "Check the " + label + " field.");
  };
  function field(k: string, required = false, max = 240) {
    const v = input[k] ?? "";
    if (typeof v !== "string" || v.length > max || (required && !v.trim()))
      invalid(k);
    return v.trim() as string;
  }
  function choices(k: string, allowed: string[]) {
    const a = input[k] ?? [];
    if (
      !Array.isArray(a) ||
      a.length > allowed.length ||
      a.some((v) => !allowed.includes(v))
    )
      invalid(k);
    return Array.from(new Set<string>(a));
  }
  function url(k: string) {
    const v = field(k, false, 1000);
    if (v && !/^https?:\/\/[^\s/]+(?:[/?#][^\s]*)?$/i.test(v)) invalid(k);
    return v;
  }
  const phone = field("phone", true);
  if (phone.replace(/\D/g, "").length < 7) invalid("phone");
  const city = field("city", true, 80), zip = field("zip", true, 10);
  const streetAddress = field("streetAddress");
  if (!streetAddress) throw new Failure(400, "Enter your business street address.");
  if (!eligibleLocation(city, zip)) throw new Failure(400, areaError);
  if (typeof input.hideAddress !== "boolean" || typeof input.hidePhone !== "boolean")
    throw new Failure(400, "Choose your address and phone visibility.");
  const businessPhone = field("businessPhone") || phone;
  if (businessPhone.replace(/\D/g, "").length < 7) invalid("business phone");
  const summary = input.summary;
  if (typeof summary !== "string" || !summary.trim()) invalid("business description");
  if (descriptionLength(summary) > descriptionLimit)
    throw new Failure(400, "Shorten your business description to 1,000 characters or fewer.");
  const neighborhood = formatServiceAreas(serviceAreaCities(field("neighborhood", true)));
  if (!neighborhood) invalid("service area");
  const week = input.weeklyHours;
  if (week != null) {
    const error = hoursError(week);
    if (error) throw new Failure(400, error);
  }
  const all = Object.values(categories).flat(),
    category = field("category", true);
  const providerType = field("providerType");
  if (providerType && !["independent", "organization"].includes(providerType)) invalid("listing type");
  if (!all.includes(category)) invalid("category");
  const logo = field("logo", false, 1000),
    gallery = input.gallery ?? [];
  if (!Array.isArray(gallery) || gallery.length > galleryLimit) invalid("photos");
  const prefix =
    process.env.NEXT_PUBLIC_SUPABASE_URL +
    "/storage/v1/object/public/directory-media/" +
    uid +
    "/";
  for (const v of [logo, ...gallery].filter(Boolean)) {
    if (
      typeof v !== "string" ||
      !v.startsWith(prefix) ||
      !/^[-a-f0-9]+\.(?:gallery\.)?(png|jpg|webp)$/.test(v.slice(prefix.length))
    )
      invalid("photo");
  }
  return {
    contact: {
      firstName: field("firstName", true),
      lastName: field("lastName", true),
      phone,
      email, streetAddress, city, zip, businessPhone,
      hideAddress: input.hideAddress, hidePhone: input.hidePhone,
    },
    draft: {
      ...(providerType ? {providerType} : {}),
      name: field("name", true),
      summary: summary.trim(),
      category,
      categories: choices("categories", all),
      services: choices("services", services),
      neighborhood,
      address: input.hideAddress ? "" : [streetAddress, city, "GA " + zip].join(", "),
      publicPhone: input.hidePhone ? "" : businessPhone,
      url: url("url"),
      booking: url("booking"),
      social: url("social"),
      ...Object.fromEntries(networks.map(({key,label,hosts})=>{
        const value = url(key);
        if (value) {
          let host = "";
          try { host = new URL(value).hostname; } catch { invalid(label); }
          if (!hosts.some(domain=>host===domain || host.endsWith("."+domain))) invalid(label);
        }
        return [key,value];
      })),
      ...(week == null ? { hours: field("hours") } : {
        weeklyHours: week.map(({day, open, opens, closes}: DayHours) => ({
          day, open, opens: validTime(opens) ? opens : "09:00", closes: validTime(closes) ? closes : "17:00",
        })),
      }),
      logo,
      gallery,
    },
  };
}
