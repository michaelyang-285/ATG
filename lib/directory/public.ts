import type { Business } from "@/lib/publication";
import { createClient } from "@supabase/supabase-js";
export async function directoryPublic(id?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const table = createClient(url, key, {
    auth: { persistSession: false },
  }).from("directory_public");
  const rows = [];
  for (let start = 0; ; start += 500) {
    let q = table
      .select("id,listing")
      .order("id")
      .range(start, start + 499);
    if (id) q = q.eq("id", id);
    const { data, error } = await q;
    if (error) throw error;
    rows.push(
      ...data.map((r) => ({ ...r.listing, _id: r.id, slug: "local-" + r.id })),
    );
    if (data.length < 500) return rows;
  }
}

export async function searchDirectory(terms: string, cities: string[] | null, category: string, service: string, editorial: Business[]): Promise<Business[]> {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {persistSession: false},
  });
  const businesses: Business[] = [];
  for (let start = 0; ; start += 500) {
    const {data, error} = await db.rpc("search_atg_directory", {
      terms, cities, category_filter: category, service_filter: service, editorial,
    }).range(start, start + 499);
    if (error) throw error;
    businesses.push(...data.map((row: {business: Business}) => row.business));
    if (data.length < 500) return businesses;
  }
}
