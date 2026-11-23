"use client";

import { useState, useEffect, useMemo, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { shift, validDay } from "@/lib/event-time";
import CompleteAccount from "./CompleteAccount";
import {hasAccountContact} from "@/lib/account-contact";
import SignupCard from "./SignupCard";
import { cities } from "@/lib/gwinnett";
import { browserClient } from "@/lib/browser-client";
export default function EventSubmission({ generalAccount = false }: { generalAccount?: boolean } = {}) {
  const client = useMemo(browserClient, []);
  const [session, setSession] = useState<Session | null>(null),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [schedule, setSchedule] = useState("once"),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [dates, setDates] = useState<{id:string; start:string; end:string}[]>([]),
    [register, setRegister] = useState(false),
    [cost, setCost] = useState("free"),
    [done, setDone] = useState(false),
    [requestId] = useState(() => globalThis.crypto.randomUUID());
  const [signin, setSignin] = useState(false),
    [sent, setSent] = useState(false),
    [email, setEmail] = useState(""),
    [account, setAccount] = useState({
      firstName: "",
      lastName: "",
      phone: "",
      name: "",
    }),
    [googleEnabled, setGoogleEnabled] = useState(false);
  useEffect(() => {
    if (!client) { setReady(true); return; }
    const controller = new AbortController();
    fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + "/auth/v1/settings", {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((settings) => setGoogleEnabled(settings?.external?.google === true))
      .catch(() => {});
    const { data } = client.auth.onAuthStateChange((_, s) => {
      setSession(s);
      setReady(true);
    });
    return () => {
      controller.abort();
      data.subscription.unsubscribe();
    };
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
      if (!session) return;
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.access_token,
        },
        body: JSON.stringify({
          ...data,
          requestId,
          action: "event",
          cost,
          until: schedule === "weekly" ? data.until : "",
          schedule,
          registrationRequired: register,
          selectedDates: schedule === "selected" ? dates : [],
        }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error);
      setDone(true);
    });
  }
  if (!ready) return <p role="status">Loading your account…</p>;
  if (!client)
    return (
      <p>Organizer accounts are unavailable here. Please try again later.</p>
    );

  if (!session)
    return (
      <SignupCard
        generalAccount={generalAccount}
        event
        {...{
          client,
          signin,
          setSignin,
          sent,
          setSent,
          email,
          setEmail,
          googleEnabled,
          busy,
          account,
          setAccount,
          run,
        }}
        setMsg={setMessage}
        status={<p role="status">{message}</p>}
        register={async password => {
          const res = await fetch("/api/directory/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              eventSignup: true,
              generalAccount,
              ...(signin
                ? {}
                : {
                    account: {
                      firstName: account.firstName,
                      lastName: account.lastName,
                      phone: account.phone,
                    },
                  }),
            }),
          });
          if (!res.ok)
            throw Error(
              (await res.json()).error || "Unable to send the sign-in link.",
            );
        }}
      />
    );
  if (!hasAccountContact(session.user.user_metadata)) return <CompleteAccount user={session.user} client={client}/>;
  if (generalAccount) return <section className="signup-card"><h2>You’re signed in</h2><p>What would you like to do?</p><p><a className="text-link" href="/events/submit">Submit an event</a></p><p><a className="text-link" href="/account">Manage or create a directory listing</a></p></section>;
  if (done)
    return (
      <>
        <a className="text-link" href="/account">View my submissions</a>
        <h1>Event sent for review</h1>
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
    <>
    <a className="text-link" href="/account">View my submissions</a>
    <form
      className="event-form"
      key={session.user.id}
      onSubmit={submit}
    >
      <h1>Submit a Gwinnett event</h1>
      <fieldset disabled={busy}>
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
                setSent(false);
                setSignin(true);
                setEmail("");
                setAccount({
                  firstName: "",
                  lastName: "",
                  phone: "",
                  name: "",
                });
              })
            }
          >
            Sign out
          </button>
        </p>
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
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <h2>Schedule</h2>
            <label>When does this event happen?
              <select value={schedule} onChange={e => setSchedule(e.target.value)}>
                <option value="once">One date</option>
                <option value="weekly">Repeats weekly</option>
                <option value="selected">Selected dates</option>
              </select>
            </label>
            <label>Starts (Eastern time)<input required type="datetime-local" name="start" value={start} onChange={e => setStart(e.target.value)} /></label>
            <label>Ends (optional, Eastern time)<input type="datetime-local" name="end" value={end} onChange={e => setEnd(e.target.value)} /></label>
            {schedule === "weekly" && input("until", "Repeat through", "date")}
            {schedule === "selected" && <>
              <p>Add each day the event is open. Each new date copies the previous hours.</p>
              {dates.map((row, i) => <fieldset key={row.id}>
                <legend>Date {i + 2}</legend>
                {(["start", "end"] as const).map(key => <label key={key}>{key === "start" ? "Starts" : "Ends (optional)"} (Eastern time)
                  <input type="datetime-local" required={key === "start"} value={row[key]}
                    onChange={e => setDates(dates.map(r => r.id === row.id ? {...r, [key]: e.target.value} : r))} />
                </label>)}
                <button type="button" onClick={() => setDates(dates.filter(r => r.id !== row.id))}>Remove date</button>
              </fieldset>)}
              <button type="button" onClick={() => {
                const previous = dates[dates.length - 1] || {start, end};
                const next = (value: string) => validDay(value.slice(0,10)) ? shift(value.slice(0,10), 1) + value.slice(10) : "";
                setDates([...dates, {id: crypto.randomUUID(), start: next(previous.start), end: next(previous.end)}]);
              }}>Add another date</button>
            </>}
            <label>
              Admission
              <select value={cost} onChange={(e) => setCost(e.target.value)}>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </label>
            {cost === "paid" && <>
              <label>
                Starting price in USD (optional)
                <input name="price" type="number" min=".01" step=".01" />
              </label>
              <label>Price is per<select name="priceUnit"><option value="person">Person</option><option value="vehicle">Vehicle</option></select></label>
              <label>Pricing details (optional)<textarea name="pricingDetails" maxLength={600} placeholder="Include age-based prices, parking, or fees." /></label>
            </>}
            <h2>Registration and links</h2>
            <label>Do attendees need to register?
              <select value={register ? "yes" : "no"} onChange={e => setRegister(e.target.value === "yes")}><option value="no">No</option><option value="yes">Yes</option></select>
            </label>
            {register && input("ticketUrl", "Registration or ticket link", "url")}
            {input("url", "Official event page (optional)", "url", false)}
            <label><input type="checkbox" name="newsletter" value="yes" /> Email me the All Things Gwinnett newsletter.</label>
            <button className="button button-orange">Submit for review</button>
      </fieldset>
      <p role="status">{message}</p>
    </form>
    </>
  );
}
