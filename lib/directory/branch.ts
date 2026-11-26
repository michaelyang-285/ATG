import type {Business} from "../publication";

type Identity = Pick<Business, "_id" | "name" | "slug" | "address" | "neighborhood">;
export type Branch = {label: string; city?: string; street?: string};
const key = (s = "") => (s || "").trim().replace(/\s+/g, " ").toLowerCase();
const addressKey = (s = "") => key(s).replace(/[.,]/g, "").replace(/\s*#\s*/g, " #");

export function publicAddress(address?: string) {
  const match = address?.trim().match(/^(.+),\s*([^,]+),\s*(?:GA|Georgia)\b(?:[ ,]+\d{5}(?:-\d{4})?)?(?:,\s*(?:USA|United States))?$/i);
  return match ? {street: match[1].trim(), city: match[2].trim()} : undefined;
}

export function indexBranchRecords(records: Identity[]) {
  const groups = new Map<string, Identity[]>();
  for (const record of records) {
    const name = key(record.name);
    if (!name) continue;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push(record);
  }
  return groups;
}

export function resolveBranch(listing: Identity, index: ReturnType<typeof indexBranchRecords>) {
  const peers = (index.get(key(listing.name)) || []).filter(p => p._id !== listing._id);
  const address = publicAddress(listing.address);
  const sameCity = address && peers.some(p => key(publicAddress(p.address)?.city) === key(address.city));
  const street = sameCity ? address.street : undefined;
  const duplicate = addressKey(listing.address);
  const matches = duplicate ? peers.filter(p => addressKey(p.address) === duplicate) : [];
  let branch: Branch | undefined;
  if (peers.length) {
    if (address) {
      branch = {label: [address.city, street].filter(Boolean).join(" · "), city: address.city, street};
    } else if (listing.address?.trim()) {
      branch = {label: listing.address.trim()};
    } else if (listing.neighborhood?.trim()) {
      branch = {label: "Serving " + listing.neighborhood.trim().replace(/^all of gwinnett$/i, "Gwinnett County")};
    }
  }
  return {branch, matches};
}

export function branchName(listing: Pick<Business, "name" | "branch">) {
  return listing.branch ? listing.name.trim() + " - " + listing.branch.label : listing.name;
}

export function publishedDuplicateGroups(index: ReturnType<typeof indexBranchRecords>) {
  const duplicates: {name: string; address: string; slugs: string[]}[] = [];
  for (const listings of Array.from(index.values())) {
    if (listings.length < 2) continue;
    const byAddress = new Map<string, Identity[]>();
    for (const listing of listings) {
      const address = addressKey(listing.address);
      if (!address) continue;
      if (!byAddress.has(address)) byAddress.set(address, []);
      byAddress.get(address)!.push(listing);
    }
    for (const group of Array.from(byAddress.values())) {
      if (group.length > 1) duplicates.push({name: group[0].name, address: group[0].address, slugs: group.map(b => b.slug)});
    }
  }
  return duplicates;
}
