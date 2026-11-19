"use client";
import { useState, useEffect, type FormEvent } from "react";
import { browserClient } from "@/lib/browser-client";
import "@/components/community.css";
export default function ResetPassword() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const client = browserClient();
    if (!client) {setAuthenticated(false); return;}
    const {data} = client.auth.onAuthStateChange((_, session) => setAuthenticated(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password"));
    if (password !== data.get("confirm")) {setMessage("The passwords don’t match."); return;}
    setBusy(true);
    try {
      const client = browserClient();
      if (!client) throw Error();
      const {error} = await client.auth.updateUser({password});
      if (error) throw error;
      location.replace("/directory/manage");
    } catch {setMessage("Couldn’t save your password. Try a different password or request a fresh reset link.");}
    finally {setBusy(false);}
  }
  return <main id="main" className="site-width page-content directory-owner"><section className="signup-card"><h1>Choose a new password</h1>{authenticated === null ? <p>Checking your link…</p> : authenticated ? <form onSubmit={save}><label>New password (at least 8 characters)<input name="password" type="password" autoComplete="new-password" required minLength={8}/></label><label>Confirm new password<input name="confirm" type="password" autoComplete="new-password" required/></label><button className="primary-action" disabled={busy}>Save password</button></form> : <p>Open the recovery link in your email to continue.</p>}<p role="status">{message}</p><a href="/forgot-password">Request a new reset link</a></section></main>;
}
