"use client";
import { useState, type FormEvent } from "react";

export default function InterestForm() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const body = Object.fromEntries(new FormData(event.currentTarget));
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/contributor-interest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error((await response.json()).error);
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "Couldn’t send your interest. Please try again.");
      setStatus("idle");
    }
  }
  if (status === "sent") return <p role="status"><strong>Thanks for raising your hand!</strong> Your note is on its way to Michael.</p>;
  return <form onSubmit={submit}>
    <label>Your name<input name="name" autoComplete="name" required maxLength={100} /></label>
    <label>Email address<input type="email" name="email" autoComplete="email" required maxLength={254} /></label>
    <label>I’d like to<select name="intent"><option>Pitch a story</option><option>Get a topic from Michael</option></select></label>
    <label>Your idea or interests<textarea name="idea" rows={4} required maxLength={2500} placeholder="What part of Gwinnett do you know firsthand?" /></label>
    {error && <p role="alert">{error}</p>}
    <button className="button button-orange" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send my interest"}</button>
  </form>;
}
