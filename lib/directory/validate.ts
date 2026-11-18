import {networks} from "./social";
import { categories, services } from "./categories";
import { Failure } from "./server";
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
  const phone = field("phone", true),
    publicEmail = field("publicEmail");
  if (phone.replace(/\D/g, "").length < 7) invalid("phone");
  if (publicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicEmail))
    invalid("public email");
  const all = Object.values(categories).flat(),
    category = field("category", true);
  if (!all.includes(category)) invalid("category");
  const logo = field("logo", false, 1000),
    gallery = input.gallery ?? [];
  if (!Array.isArray(gallery) || gallery.length > 6) invalid("photos");
  const prefix =
    process.env.NEXT_PUBLIC_SUPABASE_URL +
    "/storage/v1/object/public/directory-media/" +
    uid +
    "/";
  for (const v of [logo, ...gallery].filter(Boolean)) {
    if (
      typeof v !== "string" ||
      !v.startsWith(prefix) ||
      !/^[-a-f0-9]+\.(png|jpg|webp)$/.test(v.slice(prefix.length))
    )
      invalid("photo");
  }
  return {
    contact: {
      firstName: field("firstName", true),
      lastName: field("lastName", true),
      phone,
      email,
    },
    draft: {
      name: field("name", true),
      summary: field("summary", true, 2000),
      category,
      categories: choices("categories", all),
      services: choices("services", services),
      neighborhood: field("neighborhood", true),
      address: field("address"),
      publicEmail,
      publicPhone: field("publicPhone"),
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
      hours: field("hours"),
      logo,
      gallery,
    },
  };
}
