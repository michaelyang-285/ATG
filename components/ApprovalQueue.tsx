"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { browserClient } from "@/lib/browser-client";
import ListingPreview from "./ListingPreview";
import type { Draft } from "./OwnerDashboard";

type Listing = { id: string; revision: number; draft: Partial<Draft> };
type Removal = { id: string; name: string; deletion_due_at: string };
type EventDraft = {
  _id: string; _rev: string; title: string; summary?: string; startsAt: string; endsAt?: string;
  weeklyUntil?: string; venue: string; street?: string; city: string; organizer?: string;
  priceLabel?: string; url?: string; ticketUrl?: string;
};
type Overview = { moderator: boolean; deletions: Removal[] | null; events: EventDraft[] | null };
type Queue = Overview & { listings: Listing[] | null };
const localDate = (date: string) => new Date(date).toLocaleString("en-US", {
  timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short",
}) + " ET";

async function request(session: Session, path: string, body?: unknown) {
  const res = await fetch(path, {
    method: body ? "POST" : "GET", cache: "no-store",
    headers: { Authorization: "Bearer " + session.access_token, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw Error(data.error || "Couldn’t load the approval queue.");
  return data;
}

export default function ApprovalQueue() {
  const [client] = useState(browserClient);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    if (!client) { setSession(null); return; }
    const { data } = client.auth.onAuthStateChange((_, value) => setSession(value));
    return () => data.subscription.unsubscribe();
  }, [client]);
  if (session === undefined) return <p role="status">Checking your account…</p>;
  if (!session) return <a className="text-link" href="/directory/manage?mode=signin&next=approvals">Sign in to review submissions</a>;
  return <ReviewerQueue key={session.user.id} session={session} />;
}

function ReviewerQueue({ session }: { session: Session }) {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState("");
  const [busy, setBusy] = useState(false);
  const [version, refresh] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});
  useEffect(() => {
    let active = true;
    setQueue(null);
    setMessage("");
    async function load() {
      const data: Overview = await request(session, "/api/admin/approvals");
      const listings = data.moderator
        ? await request(session, "/api/directory/review").catch(() => null) : [];
      if (active) setQueue({ ...data, listings });
    }
    load().catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [session.access_token, version]);

  async function act(path: string, body: unknown, confirmation = "") {
    setBusy(true);
    setMessage("");
    setReceipt("");
    try {
      await request(session, path, body);
      setReceipt(confirmation);
      refresh(v => v + 1);
    }
    catch (error) { setMessage(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }

  return <>
    <div className="owner-session"><a className="text-link" href="/directory/manage">My submissions</a>
      <button disabled={busy} onClick={() => refresh(v => v + 1)}>Refresh queue</button></div>
    {receipt && <p className="submission-status" role="status">{receipt}</p>}
    {message && <p role="alert">{message}</p>}
    {!queue && !message && <p role="status">Loading submissions…</p>}
    {queue?.moderator && <>
      <section><h2>Directory profiles</h2>
        {!queue.listings ? <p role="alert">Couldn’t load profiles. Refresh to try again.</p> :
          queue.listings.length === 0 && <p>No profiles awaiting review.</p>}
        {queue.listings?.map(row => <article key={row.id}>
          <ListingPreview data={row.draft} />
          <label>Feedback for owner<textarea maxLength={1500} value={notes[row.id] || ""}
            onChange={e => setNotes({ ...notes, [row.id]: e.target.value })} /></label>
          <div className="submission-actions">
            {([["published","Approve"],["changes","Request changes"],["declined","Decline"]] as const).map(([status, label]) =>
              <button key={status} disabled={busy} onClick={() => act("/api/directory/review", {
                id: row.id, revision: row.revision, status, note: notes[row.id] || "",
              })}>{label}</button>)}
          </div>
        </article>)}
      </section>
      <section><h2>Events</h2>
        {!queue.events ? <p role="alert">Couldn’t load events. Refresh to try again.</p> :
          queue.events.length === 0 && <p>No events awaiting review.</p>}
        {queue.events?.map(event => <article key={event._id} className="break-words">
          <h3>{event.title}</h3>
          {event.summary && <p className="mt-2 whitespace-pre-line">{event.summary}</p>}
          <dl className="mt-4 grid gap-x-4 gap-y-3 sm:grid-cols-2">
            <div><dt className="font-bold">When</dt>
              <dd>{localDate(event.startsAt)}{event.endsAt && <> to {localDate(event.endsAt)}</>}
                {event.weeklyUntil && <div>Weekly through {new Date(event.weeklyUntil + "T12:00:00Z").toLocaleDateString("en-US",
                  { timeZone: "UTC", dateStyle: "long" })}</div>}
              </dd>
            </div>
            <div><dt className="font-bold">Where</dt><dd>{event.venue}<br />
              {[event.street, event.city].filter(Boolean).join(", ")}</dd></div>
            {event.organizer && <div><dt className="font-bold">Organizer</dt><dd>{event.organizer}</dd></div>}
            {event.priceLabel && <div><dt className="font-bold">Admission</dt><dd>{event.priceLabel}</dd></div>}
          </dl>
          {(event.url || event.ticketUrl) && <div className="mt-3 flex flex-wrap gap-4">
            {event.url && <a className="text-link" href={event.url} target="_blank" rel="noopener noreferrer">Event website</a>}
            {event.ticketUrl && event.ticketUrl !== event.url && <a className="text-link" href={event.ticketUrl}
              target="_blank" rel="noopener noreferrer">Tickets</a>}
          </div>}
          <div className="submission-actions">
            <button className="primary-action" disabled={busy} onClick={() => act("/api/admin/approvals/events",
              { draftId: event._id, revision: event._rev, decision: "approve" }, event.title + " was published.")}>Approve event</button>
            <button disabled={busy} onClick={() => act("/api/admin/approvals/events",
              { draftId: event._id, revision: event._rev, decision: "reject" }, event.title + " was rejected.")}>Reject event</button>
          </div>
        </article>)}
      </section>
    </>}
    {queue && <section><h2>Profile deletion requests</h2>
      {!queue.deletions ? <p role="alert">Couldn’t load deletion requests. Refresh to try again.</p> :
        queue.deletions.length === 0 && <p>No deletion requests awaiting review.</p>}
      {queue.deletions?.map(row => <article key={row.id}><h3>{row.name}</h3>
        <p>Automatic deletion by {localDate(row.deletion_due_at)}.</p>
        <button disabled={busy} onClick={() => {
          if (window.confirm("Permanently delete " + row.name + " now?"))
            act("/api/directory/deletion", { id: row.id, action: "approve" });
        }}>Approve deletion now</button>
      </article>)}
    </section>}
  </>;
}
