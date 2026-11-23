"use client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
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
    [message, setMessage] = useState("");
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
    <main id="main" className="site-width page-content directory-owner">
      <a href="/account">My account</a>
      <h1>My profile</h1>
      {!ready ? (
        <p>Loading profile…</p>
      ) : !user ? (
        <form
          className="signup-card"
          onSubmit={async (e) => {
            e.preventDefault();
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
          className="signup-card"
          key={user.id}
          onSubmit={async (e) => {
            e.preventDefault();
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
              setMessage("Your profile is saved.");
            } catch {
              setMessage("Couldn’t save your changes. Please try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <p>Signed in as {user.email}</p>
          <p>
            Share as much or as little as you like. These details are private to
            you and ATG. Adding a phone number does not subscribe you to texts.
          </p>
          {fields.map(([key, label, auto]) => (
            <label key={key}>
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
          <button className="primary-action" disabled={busy}>
            Save profile
          </button>
        </form>
      )}
      <p role="status">{message}</p>
    </main>
  );
}
