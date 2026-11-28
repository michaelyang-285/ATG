import {cache} from "react";
import {publication,type Business} from "../publication";
import {directoryPublic} from "./public";
import {groupsFor,landings} from "./browse-groups";

type Entry = Pick<Business,"slug"|"category"|"categories">;
export const categoryInventory = cache(async () => {
  const [editorial,members] = await Promise.all([
    publication.fetch<Entry[]>('*[_type=="business" && defined(slug.current)]{"slug":slug.current,category,categories}',{}, {next:{revalidate:60}}),
    directoryPublic()
  ]);
  const listings: Entry[] = [...editorial,...members];
  const populated = new Set(listings.flatMap(b=>Array.from(groupsFor(b))));
  return {listings, slugs:Object.keys(landings).filter(slug=>populated.has(landings[slug].name))};
});
