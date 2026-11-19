"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { browserClient } from "@/lib/browser-client";
import ListingPreview from "./ListingPreview";
import type { Draft } from "./OwnerDashboard";

type Listing = { id: string; revision: number; draft: Partial<Draft> };
type Removal = { id: string; name: string; deletion_due_at: string };
type EventDraft = { _id: string; title: string; startsAt: string; venue: string; city: string };
type Overview = { moderator: boolean; deletions: Removal[] | null; events: EventDraft[] | null };
type Queue = Overview & { listings: Listing[] | null };
const studio = "https://www.sanity.io/@oUcV9EK10/studio/tg2pib63zu890y3tcluji8jy";
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

  async function act(path: string, body: unknown) {
    setBusy(true);
    setMessage("");
    try { await request(session, path, body); refresh(v => v + 1); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }

  return <>
    <div className="owner-session"><a className="text-link" href="/directory/manage">My submissions</a>
      <button disabled={busy} onClick={() => refresh(v => v + 1)}>Refresh queue</button></div>
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
        {queue.events?.map(event => <article key={event._id}><h3>{event.title}</h3>
          <p>{[event.venue, event.city].filter(Boolean).join(", ")}<br />{localDate(event.startsAt)}</p>
          <a className="text-link" target="_blank" rel="noopener noreferrer"
            href={studio + "/intent/edit/id=" + encodeURIComponent(event._id.replace(/^drafts\./, "")) + ";type=event"}>
            Review event in Sanity Studio</a>
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
