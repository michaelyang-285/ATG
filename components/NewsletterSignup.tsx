"use client";
import { useState, type FormEvent } from "react";

export default function NewsletterSignup() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Please try again.");
      setSaved(true);
      setMessage("You're on the list. Thanks for subscribing!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally { setBusy(false); }
  }
  return <div>
    {!saved && <form onSubmit={subscribe}>
      <label htmlFor="atg-newsletter-email">Email address</label>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>
        <input style={{flex:"1 1 12rem",minWidth:0,padding:"0.7rem",border:"1px solid #736d65",borderRadius:6,color:"#171717",background:"white"}} id="atg-newsletter-email" name="email" autoComplete="email" type="email" maxLength={254} required />
        <button className="button button-ink" disabled={busy}>{busy ? "Signing up…" : "Subscribe"}</button>
      </div>
    </form>}
    <p role="status">{message}</p>
  </div>;
}
