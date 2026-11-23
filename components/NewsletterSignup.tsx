"use client";
import { useState } from "react";

export default function NewsletterSignup() {
  const [saved, setSaved] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (saved)
    return (
      <div role="status">
        <strong>Thanks for signing up.</strong>
        <p>
          Want to tell us where in Gwinnett you live?{" "}
          <a className="text-link" href="/account/profile">
            Add to your private profile
          </a>
        </p>
      </div>
    );
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const email = new FormData(e.currentTarget).get("email");
        setBusy(true);
        setError("");
        try {
          const res = await fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (!res.ok) throw Error();
          setSaved(true);
        } catch {
          setError("Couldn’t save your signup. Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="block font-semibold">
        Email address
        <input
          className="block w-full rounded border p-3 my-2"
          type="email"
          name="email"
          required
          autoComplete="email"
        />
      </label>
      <button className="button button-orange" disabled={busy}>
        Get the newsletter
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
