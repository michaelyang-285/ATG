import {categories} from "./categories";
import type {Business} from "../publication";

export const grocery = "Grocery Stores & Supermarkets";
export const food = "Food & Drink";
const descriptions: Partial<Record<keyof typeof categories,string>> = {
  "Beauty & Personal Care": "Find Gwinnett salons, barbers, brow studios and other personal care providers by city.",
  "Auto": "Browse Gwinnett mechanics, detailers, tire shops and towing services by city.",
  "Pets": "Find local groomers, pet sitters, boarding facilities and veterinary practices in Gwinnett County.",
  "Home & Property": "Browse electricians, plumbers, cleaners and other providers serving Gwinnett homes.",
  "Faith & Worship": "Find churches, mosques, synagogues, temples and other faith communities in Gwinnett County.",
  "Community": "Explore Gwinnett nonprofits, community centers, food pantries and civic organizations.",
  "Education": "Find Gwinnett tutors, preschools, childcare providers and youth learning programs.",
  "Health": "Browse fitness studios, clinics, dentists and counseling providers serving Gwinnett County.",
  "Shopping": "Find Gwinnett boutiques, specialty shops and local makers by city.",
  "Events": "Find Gwinnett event venues, photographers, DJs and party rental businesses.",
  "Professional Services": "Find Gwinnett marketing, accounting, insurance, legal and technology providers."
};
export const landings: Record<string, {name:string; description:string}> = {
  ...Object.fromEntries(Object.keys(categories).map(name => [name.toLowerCase().replace(/[^a-z0-9]+/g,"-"), {name, description:descriptions[name as keyof typeof categories] || `Explore local listings for ${name.toLowerCase()} in Gwinnett County.`} ])),
  "food-drink": {name:food, description:"Find restaurants, bakeries and other places to eat in Gwinnett County. Browse local listings by city."},
  "grocery-stores-supermarkets": {name:grocery, description:"Compare grocery stores and supermarket branches across Gwinnett County. Browse by city and find the street address for each store."},
};
export function groupFor(category = "Community") {
  if (category === grocery) return grocery;
  if (category === "Food") return food;
  return Object.entries(categories).find(([family, children]) => family === category || children.includes(category))?.[0] || category;
}
export function groupsFor(b: Pick<Business,"category"|"categories">) {
  return new Set([b.category, ...(b.categories || [])].filter(Boolean).map(category => groupFor(category)));
}
export function groupUrl(name:string) {
  const slug = Object.keys(landings).find(key => landings[key].name === name);
  return slug ? "/directory/category/" + slug : "/directory?group=" + encodeURIComponent(name);
}
