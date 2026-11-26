import {cache} from "react";
import {publication, type Business} from "../publication";
import {directoryClient} from "./public";
import {indexBranchRecords} from "./branch";

type RecordFields = Pick<Business, "_id" | "name" | "slug" | "address" | "neighborhood">;

// A narrow public projection keeps branch labels consistent across filters, profiles and previews.
async function localRecords(word: string) {
  const db = directoryClient();
  if (!db) return [];
  const records: RecordFields[] = [];
  for (let start = 0; ; start += 500) {
    let query = db.from("directory_public")
      .select("_id:id,name:listing->>name,slug:listing->>profileSlug,address:listing->>address,neighborhood:listing->>neighborhood")
      .order("id").range(start, start + 499);
    if (word) query = query.ilike("listing->>name", "%" + word + "%");
    const {data, error} = await query;
    if (error) throw error;
    records.push(...data);
    if (data.length < 500) return records;
  }
}

export const getBranchIndex = cache(async (name?: string) => {
  // On a single profile, retrieve just candidate peers. The shared grouping logic
  // still compares the full name, including punctuation, across both sources.
  const word = (name?.toLowerCase().match(/[a-z0-9]+/g) || []).sort((a,b) => b.length - a.length)[0] || "";
  const filter = word ? " && count(string::split(lower(name), $word)) > 1" : "";
  const [local, editorial] = await Promise.all([
    localRecords(word),
    publication.fetch<RecordFields[]>(`*[_type=="business" && defined(slug.current)${filter}]{_id,name,"slug":slug.current,address,neighborhood}`, {word}, {next:{revalidate:60}}),
  ]);
  return indexBranchRecords([...editorial, ...local]);
});
