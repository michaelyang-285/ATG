"use client";
import { useState } from "react";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import { hasAccountContact } from "@/lib/account-contact";

export default function CompleteAccount({
  user,
  client,
}: {
  user: User;
  client: SupabaseClient;
}) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const info = user.user_metadata;
  return (
    <form
      className="signup-card"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const data = Object.fromEntries(
          ["firstName", "lastName", "phone"].map((k) => [
            k,
            String(f.get(k) || "").trim(),
          ]),
        );
        if (!hasAccountContact(data)) {
          setMessage(
            "Enter your first name, last name, and a valid phone number.",
          );
          return;
        }
        setBusy(true);
        try {
          const { error } = await client.auth.updateUser({ data });
          if (error) throw error;
          location.reload();
        } catch {
          setMessage("Couldn’t save your details. Please try again.");
          setBusy(false);
        }
      }}
    >
      <h2>Complete your account</h2>
      <label>
        First name
        <input
          name="firstName"
          autoComplete="given-name"
          required
          maxLength={240}
          defaultValue={info.firstName || info.given_name || ""}
        />
      </label>
      <label>
        Last name
        <input
          name="lastName"
          autoComplete="family-name"
          required
          maxLength={240}
          defaultValue={info.lastName || info.family_name || ""}
        />
      </label>
      <label>
        Phone number
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          required
          maxLength={240}
          defaultValue={info.phone || user.phone || ""}
        />
      </label>
      <button className="primary-action" disabled={busy}>
        Save and continue
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
