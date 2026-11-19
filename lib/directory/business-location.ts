import { zipAreas } from "./locations";

// Nearby mailing cities and aliases for ZIP codes that cross municipal lines.
const neighbors: Record<string, string[]> = {
  "30004": ["Alpharetta", "Milton"], "30005": ["Alpharetta", "Johns Creek"],
  "30009": ["Alpharetta"], "30022": ["Alpharetta", "Johns Creek"],
  "30024": ["Johns Creek"], "30039": ["Centerville"],
  "30040": ["Cumming"], "30041": ["Cumming"], "30047": ["Mountain Park"],
  "30071": ["Peachtree Corners"], "30093": ["Peachtree Corners"],
  "30096": ["Peachtree Corners"], "30097": ["Johns Creek"],
  "30542": ["Flowery Branch"], "30680": ["Winder"],
};
export function eligibleLocation(city: unknown, zip: unknown) {
  if (typeof city !== "string" || typeof zip !== "string") return false;
  const match = /^(\d{5})(?:-\d{4})?$/.exec(zip.trim());
  if (!match) return false;
  const normalized = city.trim().replace(/\s+/g, " ").toLowerCase();
  return [...(zipAreas[match[1]] || []), ...(neighbors[match[1]] || [])]
    .some(place => place.toLowerCase() === normalized);
}
export const areaError = "Enter a matching Georgia city and ZIP code in Gwinnett or a surrounding community.";
