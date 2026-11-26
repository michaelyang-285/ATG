import type { Business } from "@/lib/publication";
import { createClient } from "@supabase/supabase-js";
// Public profile data can change as soon as an owner hides details or requests removal.
const fetchCurrentListing: typeof fetch = (input, init) => fetch(input, {...init, cache: "no-store"});
export function directoryClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: fetchCurrentListing },
  });
}
export async function directoryPublic(filter?: {id: string} | {path: string}) {
  const client = directoryClient();
  if (!client) return [];
  const table = client.from(filter && "path" in filter ? "directory_profile_paths" : "directory_public");
  const rows = [];
  for (let start = 0; ; start += 500) {
    let q = table
      .select("id,listing")
      .order("id")
      .range(start, start + 499);
    if (filter) q = "id" in filter ? q.eq("id", filter.id) : q.eq("path", filter.path);
    const { data, error } = await q;
    if (error) throw error;
    rows.push(
      ...data.map((r) => ({ ...r.listing, _id: r.id, slug: r.listing.profileSlug })),
    );
    if (data.length < 500) return rows;
  }
}

export async function searchDirectory(terms: string, cities: string[] | null, category: string, service: string, editorial: Business[]): Promise<Business[]> {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {persistSession: false},
    global: { fetch: fetchCurrentListing },
  });
  const businesses: Business[] = [];
  for (let start = 0; ; start += 500) {
    const {data, error} = await db.rpc("search_atg_directory", {
      terms, cities, category_filter: category, service_filter: service, editorial,
    }).range(start, start + 499);
    if (error) throw error;
    businesses.push(...data.map(({business}: {business: Business & {profileSlug?: string}}) =>
      business.profileSlug ? {...business, slug: business.profileSlug} : business
    ));
    if (data.length < 500) {
      const exact=terms.trim().toLowerCase();
      return businesses.sort((a,b)=> Number(b.name.toLowerCase()===exact)-Number(a.name.toLowerCase()===exact) || Number(!!b.premium)-Number(!!a.premium));
    }
  }
}
