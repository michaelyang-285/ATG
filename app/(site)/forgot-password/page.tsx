"use client";
import { useState, type FormEvent } from "react";
import { browserClient } from "@/lib/browser-client";
import "@/components/community.css";
export default function ForgotPassword() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    setBusy(true);
    try {
      const client = browserClient();
      if (!client) throw Error();
      const {error} = await client.auth.resetPasswordForEmail(email, {redirectTo: location.origin + "/reset-password"});
      if (error) throw error;
      setMessage("If your account uses this email, check your inbox for a password reset link.");
    } catch { setMessage("Couldn’t request a reset. Please wait a moment and try again."); }
    finally { setBusy(false); }
  }
  return <main id="main" className="site-width page-content directory-owner"><section className="signup-card"><h1>Set or reset your password</h1><p>Enter your ATG account email. You can also use this to set your first password if you previously signed in by email link.</p><form onSubmit={submit}><label>Email address<input required name="email" type="email" autoComplete="email"/></label><button className="primary-action" disabled={busy}>Send reset link</button></form><p role="status">{message}</p><a href="/account?mode=signin">Back to sign in</a></section></main>;
}
