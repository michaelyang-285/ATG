"use client";
import { useState, useEffect, useMemo, type FormEvent } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import { cities } from "@/lib/gwinnett";
export default function EventSubmission() {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
      key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createClient(url, key) : null;
  }, []);
  const [session, setSession] = useState<Session | null>(null),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [complete, setComplete] = useState(false),
    [weekly, setWeekly] = useState(false),
    [cost, setCost] = useState("free"),
    [done, setDone] = useState(false),
    [requestId] = useState(() => globalThis.crypto.randomUUID());
  useEffect(() => {
    if (!client) return;
    const { data } = client.auth.onAuthStateChange((_, s) => {
      setSession(s);
      setReady(true);
      setComplete(
        Boolean(
          s?.user.user_metadata.firstName && s?.user.user_metadata.lastName,
        ),
      );
    });
    return () => data.subscription.unsubscribe();
  }, [client]);
  async function run(fn: () => Promise<void>) {
    setMessage("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(ev.currentTarget));
    await run(async () => {
      if (!session) {
        const res = await fetch("/api/directory/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, eventSignup: true }),
        });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error);
        setMessage(
          "Check your email for a sign-in link to continue to your event.",
        );
        return;
      }
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.access_token,
        },
        body: JSON.stringify({
          ...data,
          requestId,
          action: complete ? "event" : "profile",
          cost,
          until: weekly ? data.until : "",
        }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error);
      if (complete) setDone(true);
      else {
        await client!.auth.refreshSession();
        setComplete(true);
      }
    });
  }
  if (!client)
    return (
      <p>Organizer accounts are unavailable here. Please try again later.</p>
    );
  if (!ready) return <p>Loading your account…</p>;
  if (done)
    return (
      <>
        <h2>Event sent for review</h2>
        <p>
          ATG will review your details before the event appears on the calendar.
        </p>
        <a href="/events">Return to the calendar</a>
      </>
    );
  function input(name: string, label: string, type = "text", required = true) {
    return (
      <label>
        {label}
        <input
          name={name}
          type={type}
          required={required}
          maxLength={type === "url" ? 1000 : 240}
        />
      </label>
    );
  }
  return (
    <form
      className="event-form"
      key={session ? (complete ? "event" : "profile") : "signin"}
      onSubmit={submit}
    >
      <fieldset disabled={busy}>
        {!session ? (
          <>
            <h2>Sign in or create an account</h2>
            <button
              className="button"
              type="button"
              onClick={() =>
                run(async () => {
                  const { error } = await client.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: location.origin + "/events/submit",
                      queryParams: { prompt: "select_account" },
                    },
                  });
                  if (error) throw error;
                })
              }
            >
              Continue with Google
            </button>
            {input("email", "Email address", "email")}
            <button className="button button-orange">
              Email me a sign-in link
            </button>
          </>
        ) : (
          <>
            <p>
              Signed in as {session.user.email} ·{" "}
              <button
                type="button"
                onClick={() =>
                  run(async () => {
                    const { error } = await client.auth.signOut({
                      scope: "local",
                    });
                    if (error) throw error;
                  })
                }
              >
                Sign out
              </button>
            </p>
            {!complete ? (
              <>
                <h2>Create your organizer profile</h2>
                {input("firstName", "First name")}
                {input("lastName", "Last name")}
                <button className="button button-orange">
                  Continue to event
                </button>
              </>
            ) : (
              <>
                <h2>Event details</h2>
                {input("title", "Event name")}
                {input("organizer", "Public organizer name")}
                <label>
                  Description
                  <textarea name="summary" required maxLength={3000} />
                </label>
                {input("venue", "Venue")}
                {input("street", "Street address")}
                <label>
                  City
                  <select name="city" required defaultValue="">
                    <option value="">Choose a city</option>
                    {cities.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                {input("start", "Starts (Eastern time)", "datetime-local")}
                {input(
                  "end",
                  "Ends (optional, Eastern time)",
                  "datetime-local",
                  false,
                )}
                <label>
                  Repeats
                  <select
                    value={weekly ? "weekly" : "once"}
                    onChange={(e) => setWeekly(e.target.value === "weekly")}
                  >
                    <option value="once">Once</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </label>
                {weekly && input("until", "Repeat through", "date")}
                <label>
                  Admission
                  <select
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </label>
                {cost === "paid" && (
                  <label>
                    Ticket price in USD (optional)
                    <input name="price" type="number" min=".01" step=".01" />
                  </label>
                )}
                {input(
                  "url",
                  "Event or ticket website (optional)",
                  "url",
                  false,
                )}
                <button className="button button-orange">
                  Submit for review
                </button>
              </>
            )}
          </>
        )}
      </fieldset>
      <p role="status">{message}</p>
    </form>
  );
}
