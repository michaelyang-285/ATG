import { notFound, permanentRedirect, redirect } from "next/navigation";
import { enrich, libraryEventPath, libraryFeed } from "@/lib/library-events";

export default async function LegacyLibraryEvent({ params }: { params: { id: string } }) {
  if (!/^\d+$/.test(params.id)) notFound();
  const event = (await libraryFeed()).events.find(row => row.id === params.id);
  if (!event) notFound();
  const detail = await enrich(event);
  if (!detail.branch) redirect(libraryEventPath(detail));
  permanentRedirect(libraryEventPath(detail));
}
