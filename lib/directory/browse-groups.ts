import {categories} from "./categories";
import type {Business} from "../publication";

export const grocery = "Grocery Stores & Supermarkets";
export const food = "Food & Drink";
export const landings: Record<string, {name:string; description:string}> = {
  "food-drink": {name:food, description:"Find restaurants, bakeries and other places to eat in Gwinnett County. Browse local listings by city."},
  "grocery-stores-supermarkets": {name:grocery, description:"Compare grocery stores and supermarket branches across Gwinnett County. Browse by city and find the street address for each store."},
};
export function groupFor(category = "Community") {
  if (category === grocery) return grocery;
  if (category === "Food") return food;
  return Object.entries(categories).find(([family, children]) => family === category || children.includes(category))?.[0] || category;
}
export function groupsFor(b: Business) {
  return new Set([b.category, ...(b.categories || [])].filter(Boolean).map(category => groupFor(category)));
}
export function groupUrl(name:string) {
  const slug = Object.keys(landings).find(key => landings[key].name === name);
  return slug ? "/directory/category/" + slug : "/directory?group=" + encodeURIComponent(name);
}
