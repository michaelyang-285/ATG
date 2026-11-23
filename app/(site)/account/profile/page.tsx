"use client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import "./profile.css";
import { browserClient } from "@/lib/browser-client";

const fields = [
  ["firstName", "First name", "given-name"],
  ["lastName", "Last name", "family-name"],
  ["phone", "Phone number", "tel"],
  ["personalStreet", "Street address", "address-line1"],
  ["personalUnit", "Apartment or suite", "address-line2"],
  ["personalCity", "City", "address-level2"],
  ["personalState", "State", "address-level1"],
  ["personalZip", "ZIP code", "postal-code"],
] as const;

export default function MyProfile() {
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 6000);
    return () => window.clearTimeout(timer);
  }, [saved]);
  useEffect(() => {
    const client = browserClient();
    if (!client) {
      setMessage("Profile sign-in is unavailable.");
      setReady(true);
      return;
    }
    const { data } = client.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <main
      id="main"
      className="site-width page-content directory-owner private-profile"
    >
      <header className="private-profile-header">
        <a href="/account">← My account</a>
        <h1>My profile</h1>
        {user && <p>{user.email}</p>}
      </header>
      {!ready ? (
        <p>Loading profile…</p>
      ) : !user ? (
        <form
          className="profile-signin"
          onSubmit={async (e) => {
            e.preventDefault();
            setMessage("");
            setSaved(false);
            const email = String(
              new FormData(e.currentTarget).get("email"),
            ).trim();
            setBusy(true);
            try {
              const client = browserClient();
              if (!client) throw Error();
              const { error } = await client.auth.signInWithOtp({
                email,
                options: {
                  emailRedirectTo: location.origin + "/account/profile",
                },
              });
              if (error) throw error;
              setMessage("Check your inbox for your secure profile link.");
            } catch {
              setMessage(
                "Couldn’t send the profile link. Please try again later.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <p>Enter your email to get a secure link to your private profile.</p>
          <label>
            Email address
            <input type="email" autoComplete="email" name="email" required />
          </label>
          <button className="primary-action" disabled={busy}>
            Email my profile link
          </button>
        </form>
      ) : (
        <form
          className="profile-editor"
          onChange={() => {
            setSaved(false);
            setMessage("");
          }}
          key={user.id}
          onSubmit={async (e) => {
            e.preventDefault();
            setMessage("");
            setSaved(false);
            const form = new FormData(e.currentTarget);
            const data = Object.fromEntries(
              fields.map(([key]) => [key, String(form.get(key) || "").trim()]),
            );
            if (data.phone && data.phone.replace(/\D/g, "").length < 7) {
              setMessage("Enter a valid phone number or leave it blank.");
              return;
            }
            setBusy(true);
            try {
              const client = browserClient();
              if (!client) throw Error();
              const { error } = await client.auth.updateUser({ data });
              if (error) throw error;
              setSaved(true);
            } catch {
              setMessage("Couldn’t save your changes. Please try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {[
            {
              heading: "Contact details",
              description:
                "Your name and phone are optional. Adding a number won’t sign you up for texts.",
              items: fields.slice(0, 3),
            },
            {
              heading: "Private address",
              description:
                "Only you and ATG can see this address. Share as much or as little as you like.",
              items: fields.slice(3),
            },
          ].map((group) => (
            <section className="profile-form-section" key={group.heading}>
              <div>
                <h2>{group.heading}</h2>
                <p>{group.description}</p>
              </div>
              <fieldset className="profile-inputs" disabled={busy}>
                <legend className="sr-only">{group.heading}</legend>
                {group.items.map(([key, label, auto]) => (
                  <label
                    key={key}
                    className={
                      key === "phone" || key === "personalStreet"
                        ? "profile-wide"
                        : undefined
                    }
                  >
                    {label}
                    <input
                      name={key}
                      autoComplete={auto}
                      type={key === "phone" ? "tel" : "text"}
                      maxLength={240}
                      defaultValue={user.user_metadata[key] ?? ""}
                    />
                  </label>
                ))}
              </fieldset>
            </section>
          ))}
          <footer>
            <button className="primary-action" disabled={busy}>
              {busy ? "Saving…" : "Save profile"}
            </button>
          </footer>
        </form>
      )}
      <div role="status" aria-live="polite" aria-atomic="true">
        {saved && user && (
          <div className="profile-saved">
            <span aria-hidden="true">↑</span>
            <strong>Profile updated</strong>
            <button
              type="button"
              aria-label="Dismiss confirmation"
              onClick={() => setSaved(false)}
            >
              ×
            </button>
          </div>
        )}
        {message && <p>{message}</p>}
      </div>
    </main>
  );
}
