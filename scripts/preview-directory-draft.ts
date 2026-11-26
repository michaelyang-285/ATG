import {readFile, writeFile} from "node:fs/promises";
import type {Business} from "../lib/publication";
import {directoryPreview} from "../lib/directory/share";
import {checkedDirectoryPng} from "../lib/directory/share-image";

async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw Error("Usage: preview-directory-draft <listing.json> <preview.png>");
  const doc = JSON.parse(await readFile(input, "utf8"));
  const draft = doc.draft || doc;
  if (!draft.name?.trim()) throw Error("The directory draft needs a business name.");
  const slug = typeof draft.slug === "string" ? draft.slug : draft.slug?.current || draft.profileSlug || "";
  const preview = directoryPreview({...draft, slug, _id: doc._id || doc.id || ""} as Business);
  const {card, ...copy} = preview;
  if (Object.values(copy).some(value => !value?.trim())) throw Error("Incomplete directory preview copy.");
  await writeFile(output, await checkedDirectoryPng(card));
  console.log(JSON.stringify({...copy, image: output}, null, 2));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
