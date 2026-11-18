"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

type EventRow = { eventId: string; draft?: { title: string }; published?: { title: string; slug?: string } };
type Item = { id: string; title: string; status: string; href?: string };
export default function MySubmissions({ session }: { session: Session }) {
  const [events, setEvents] = useState<Item[] | string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    async function read(path: string) {
      const result = await fetch(path, { signal: controller.signal, cache: "no-store", headers: { Authorization: "Bearer " + session.access_token } });
      if (!result.ok) throw Error();
      return result.json();
    }
    read("/api/events").then(({ events }: { events: EventRow[] }) => {
      setEvents(events.map(row => ({ id: row.eventId, title: row.published?.title || row.draft?.title || "Event",
        status: row.published ? "Published" : "In review",
        href: row.published?.slug ? "/events/" + encodeURIComponent(row.published.slug) : undefined })));
    }).catch(() => { if (!controller.signal.aborted) setEvents("Unable to load events. Refresh to retry."); });
    return () => controller.abort();
  }, [session.access_token]);
  return <section aria-labelledby="event-submissions" style={{ marginBlock: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #dedad3" }}>
    <h2 id="event-submissions">Events</h2>
    {events === null ? <p>Loading events…</p> : typeof events === "string" ? <p role="status">{events}</p>
      : events.length ? events.map(event => (
        <article key={event.id}>
          <h3>{event.href ? <a href={event.href}>{event.title}</a> : event.title}</h3>
          <p>{event.status}</p>
        </article>
      )) : <p>No event submissions yet.</p>}
    <a className="text-link" href="/events/submit">Submit an event</a>
  </section>;
}
