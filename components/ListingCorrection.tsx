"use client";

import { useRef, useState, type FormEvent } from "react";
import { correctionOptIn, correctionRoles } from "@/lib/directory/correction";
import "./listing-correction.css";

const endpoint = "/api/directory/corrections";

export default function ListingCorrection({ name, slug, sample = false }: { name: string; slug: string; sample?: boolean }) {
  const [claim,setClaim]=useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const submissionId = useRef("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || sample) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    if (!submissionId.current) submissionId.current = crypto.randomUUID();
    setError("");
    setSending(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(fields),
          slug, claim,
          submissionId: submissionId.current,
          marketingOptIn: fields.has("marketingOptIn"),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Please try again.");
      setSent(true);
      form.reset();
      submissionId.current = "";
    } catch (problem) {
      setError(problem instanceof TypeError ? "Check your connection and try again." :
        problem instanceof Error ? problem.message : "Please try again.");
    } finally {
      setSending(false);
    }
  }

  return <>
    <p className="listing-correction-prompt">
      <button type="button" aria-haspopup="dialog" onClick={()=>{setClaim(true);dialog.current?.showModal()}}>Claim this listing</button><br/>
      Is this information not right?{" "}
      <button type="button" aria-haspopup="dialog" onClick={() => {setClaim(false);dialog.current?.showModal()}}>Let us know.</button>
    </p>
    <dialog className="listing-correction-dialog" ref={dialog} aria-labelledby="correction-title"
      onClose={() => { if (sent) setSent(false); }}>
      <div className="correction-sheet">
        <div className="correction-heading">
          <h2 id="correction-title">{claim ? "Claim this listing" : "Suggest a correction"}</h2>
          <button className="correction-close" type="button" aria-label="Close form" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <p className="correction-business">{name}</p>
        {sent ? <div role="status">
          <p>{claim ? "Your claim was sent. ATG will contact you to verify ownership." : "Thanks for letting us know. The ATG team will review your correction."}</p>
          <button className="button button-orange" type="button" onClick={() => dialog.current?.close()}>Done</button>
        </div> : <form onSubmit={submit}>
          <fieldset disabled={sending}>
            <div className="correction-names">
              <label>First name<input name="firstName" autoComplete="given-name" maxLength={100} required /></label>
              <label>Last name<input name="lastName" autoComplete="family-name" maxLength={100} required /></label>
            </div>
            <label>Email address<input type="email" name="email" autoComplete="email" maxLength={254} required /></label>
            <label>Relationship to the business
              <select name="relationship" defaultValue="" required>
                <option value="" disabled>Select one</option>
                {correctionRoles.map(role => <option key={role}>{role}</option>)}
              </select>
            </label>
            <label>{claim ? "How can ATG verify you represent this business?" : "What needs correcting?"}
              <textarea name="correction" rows={3} maxLength={3000} placeholder={claim ? "Include your business email or another way to verify your role." : "Tell us what’s incorrect and what it should say."} required />
            </label>
            <label className="correction-opt-in"><input type="checkbox" name="marketingOptIn" />{correctionOptIn}</label>
          </fieldset>
          {error && <p className="correction-error" role="alert">{error}</p>}
          {sample && <p>This sample form is for preview only.</p>}
          <button className="button button-orange" type="submit" disabled={sending || sample}>{sending ? "Sending…" : claim ? "Send claim request" : "Send correction"}</button>
        </form>}
      </div>
    </dialog>
  </>;
}
