"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

type EventRow = { eventId: string; draft?: { title: string }; published?: { title: string; slug?: string } };
type Item = { id: string; title: string; status: string; href?: string };
export default function MySubmissions({ session, refreshKey }: { session: Session; refreshKey: number }) {
  const [events, setEvents] = useState<Item[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoadFailed(false);
    async function read(path: string) {
      const result = await fetch(path, { signal: controller.signal, cache: "no-store", headers: { Authorization: "Bearer " + session.access_token } });
      if (!result.ok) throw Error();
      return result.json();
    }
    read("/api/events").then(({ events }: { events: EventRow[] }) => {
      if (controller.signal.aborted) return;
      setEvents(events.map(row => ({ id: row.eventId, title: row.published?.title || row.draft?.title || "Event",
        status: row.published ? "Published" : "In review",
        href: row.published?.slug ? "/events/" + encodeURIComponent(row.published.slug) : undefined })));
    }).catch(() => { if (!controller.signal.aborted) setLoadFailed(true); });
    return () => controller.abort();
  }, [session.access_token, refreshKey]);
  return <section className="owner-submissions-section" aria-labelledby="event-submissions">
    <div className="owner-section-heading">
      <h2 id="event-submissions">Events</h2>
      <a className="button button-orange" href="/events/submit">Submit an event</a>
    </div>
    {loadFailed && <p className="submission-status" role="status">Your event list is temporarily unavailable.</p>}
    {events?.map(event => (
      <article key={event.id}>
        <h3>{event.href ? <a href={event.href}>{event.title}</a> : event.title}</h3>
        <p>{event.status}</p>
      </article>
    ))}
    {!loadFailed && !events?.length && <p className="submission-status" role="status">
      {events ? "No events to show." : "Loading events…"}
    </p>}
  </section>;
}
