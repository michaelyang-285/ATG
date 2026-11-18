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
