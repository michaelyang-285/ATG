import { publication } from "@/lib/publication";

export function eventStore() {
  const token = process.env.SANITY_WRITE_TOKEN?.trim();
  if (!token) throw new Error("Event storage unavailable");
  return publication.withConfig({ token, useCdn: false, perspective: "raw" });
}
