"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

type Row = { id: string; draft: { name?: string }; status: string };
type Draft = { listing_id: string; fields: { name?: string } };
type EventRow = { eventId: string; draft?: { title: string }; published?: { title: string; slug?: string } };
type Item = { id: string; title: string; status: string; href?: string };
const labels: Record<string, string> = { unpaid: "Awaiting payment", review: "In review", published: "Published", changes: "Changes requested", declined: "Declined" };

function SubmissionList({ title, items }: { title: string; items: Item[] | string | null }) {
  return <div><h3>{title}</h3>
    {items === null ? <p>Loading…</p> : typeof items === "string" ? <p role="status">{items}</p>
      : items.length ? <ul>{items.map(item => <li key={item.id}>
        {item.href ? <a href={item.href}>{item.title}</a> : item.title} · {item.status}
      </li>)}</ul> : <p>No submissions yet.</p>}
  </div>;
}

export default function MySubmissions({ session }: { session: Session }) {
  const [listings, setListings] = useState<Item[] | string | null>(null);
  const [events, setEvents] = useState<Item[] | string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    async function read(path: string) {
      const result = await fetch(path, { signal: controller.signal, cache: "no-store", headers: { Authorization: "Bearer " + session.access_token } });
      if (!result.ok) throw Error();
      return result.json();
    }
    read("/api/directory/owner").then(({ rows, progress }: { rows: Row[]; progress: Draft[] }) => {
      const ids = new Set(rows.map(row => row.id));
      setListings([
        ...rows.map(row => ({ id: row.id, title: row.draft.name || "Directory listing", status: labels[row.status] || row.status })),
        ...progress.filter(row => !ids.has(row.listing_id)).map(row => ({ id: row.listing_id, title: row.fields.name || "Untitled listing", status: "Draft" }))
      ]);
    }).catch(() => { if (!controller.signal.aborted) setListings("Unable to load listings. Refresh to retry."); });
    read("/api/events").then(({ events }: { events: EventRow[] }) => {
      setEvents(events.map(row => ({ id: row.eventId, title: row.published?.title || row.draft?.title || "Event",
        status: row.published ? "Published" : "In review",
        href: row.published?.slug ? "/events/" + encodeURIComponent(row.published.slug) : undefined })));
    }).catch(() => { if (!controller.signal.aborted) setEvents("Unable to load events. Refresh to retry."); });
    return () => controller.abort();
  }, [session.access_token]);
  return <div className="event-day"><h2>My submissions</h2>
    <SubmissionList title="Directory listings" items={listings} />
    <a href="/directory/manage">Manage directory listings</a>
    <SubmissionList title="Events" items={events} />
    <a href="/events/submit">Submit an event</a>
  </div>;
}
