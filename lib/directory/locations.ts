import { cities } from "@/lib/gwinnett";

// Mailing areas can cross city and county boundaries. These names are directory
// search areas, not an address-level determination of county residency.
// https://www.gwinnettcounty.com/static/departments/planning/Data_Maps_Reports/gwinnett_county_zipcode_map.pdf
export const county = "Gwinnett County";
export const zipAreas: Record<string, string[]> = {
  "30011": ["Auburn", "Mulberry"], "30012": ["Conyers"], "30017": ["Grayson"],
  "30019": ["Dacula", "Mulberry"], "30024": ["Suwanee", "Sugar Hill"],
  "30039": ["Snellville"], "30042": ["Lawrenceville"], "30043": ["Lawrenceville"],
  "30044": ["Lawrenceville"], "30045": ["Lawrenceville"], "30046": ["Lawrenceville"],
  "30047": ["Lilburn"], "30048": ["Lilburn"], "30049": ["Lawrenceville"],
  "30052": ["Loganville"], "30058": ["Lithonia"], "30071": ["Norcross"],
  "30078": ["Snellville"], "30084": ["Tucker"], "30087": ["Stone Mountain"],
  "30091": ["Norcross"], "30092": ["Peachtree Corners", "Norcross"],
  "30093": ["Norcross"], "30095": ["Duluth"], "30096": ["Duluth", "Berkeley Lake"],
  "30097": ["Duluth", "Peachtree Corners"], "30099": ["Duluth"],
  "30340": ["Doraville", "Atlanta"], "30350": ["Sandy Springs", "Atlanta"],
  "30360": ["Doraville", "Peachtree Corners", "Atlanta"],
  "30515": ["Buford"], "30517": ["Braselton"], "30518": ["Buford", "Sugar Hill", "Rest Haven"],
  "30519": ["Buford", "Mulberry"], "30548": ["Hoschton", "Mulberry"], "30620": ["Bethlehem"]
};
export const places = Array.from(new Set([...cities, ...Object.values(zipAreas).flat()])).sort();
export function resolveArea(raw: string) {
  const query = raw.trim().replace(/,?\s+(ga|georgia)$/i, "").trim().toLowerCase();
  if (["", "gwinnett", "gwinnett county", "all of gwinnett"].includes(query)) return null;
  const zip = query.match(/^(\d{5})(?:-\d{4})?$/);
  return zip ? zipAreas[zip[1]] || [] : places.filter(city => city.toLowerCase() === query);
}
