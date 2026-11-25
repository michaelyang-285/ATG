"use client";

import { useRef, useState, type FormEvent } from "react";
import { correctionOptIn, correctionRoles, type DirectoryRequest } from "@/lib/directory/correction";
import "./listing-correction.css";

const endpoint = "/api/directory/corrections";

const formCopy = {
  correction: {
    title: "Suggest a correction", question: "What needs correcting?",
    hint: "Tell us what’s incorrect and what it should say.", submit: "Send correction",
    success: "Thanks for letting us know. The ATG team will review your correction.",
  },
  claim: {
    title: "Claim this listing", question: "How can ATG verify you represent this business?",
    hint: "Include your business email or another way to verify your role.", submit: "Send claim request",
    success: "Your claim was sent. ATG will contact you to verify ownership.",
  },
  dispute: {
    title: "Request ownership review", question: "Why should ATG review who manages this listing?",
    hint: "Tell us about your role and include a business website or work email we can use to verify it.",
    submit: "Send review request", success: "ATG received your ownership review request.",
  },
} satisfies Record<DirectoryRequest, Record<"title" | "question" | "hint" | "submit" | "success", string>>;

export default function ListingCorrection({ name, slug, claimed, sample = false }: { name: string; slug: string; claimed: boolean; sample?: boolean }) {
  const [kind, setKind] = useState<DirectoryRequest>("correction");
  const [ticket, setTicket] = useState("");
  const copy = formCopy[kind];
  const dialog = useRef<HTMLDialogElement>(null);
  const submissionId = useRef("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function openForm(next: DirectoryRequest) {
    if (sending) return;
    if (kind !== next) submissionId.current = "";
    setKind(next);
    setSent(false);
    setTicket("");
    setError("");
    dialog.current?.showModal();
  }

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
          slug, kind,
          submissionId: submissionId.current,
          marketingOptIn: fields.has("marketingOptIn"),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Please try again.");
      setTicket(result.ticket || "");
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
    <div className="listing-correction-prompt">
      {claimed ? <>
        <strong className="listing-claimed">Claimed listing</strong>
        <p>An ATG member manages this listing.</p>
        <button type="button" aria-haspopup="dialog" onClick={() => openForm("dispute")}>Request ownership review</button>
      </> : <button type="button" aria-haspopup="dialog" onClick={() => openForm("claim")}>Claim this listing</button>}
      <p><button type="button" aria-haspopup="dialog" onClick={() => openForm("correction")}>Suggest a correction</button></p>
    </div>
    <dialog className="listing-correction-dialog" ref={dialog} aria-labelledby="correction-title"
      onCancel={event => { if (sending) event.preventDefault(); }}>
      <div className="correction-sheet">
        <div className="correction-heading">
          <h2 id="correction-title">{copy.title}</h2>
          <button className="correction-close" type="button" aria-label="Close form" disabled={sending} onClick={() => dialog.current?.close()}>×</button>
        </div>
        <p className="correction-business">{name}</p>
        {sent ? <div role="status">
          <p>{copy.success}</p>
          {ticket && <p>Ticket reference <strong>{ticket}</strong></p>}
          <button className="button button-orange" type="button" onClick={() => dialog.current?.close()}>Done</button>
        </div> : <form key={kind} onSubmit={submit}>
          {kind === "dispute" && <p>ATG will verify your connection to the business before changing who can manage this listing.</p>}
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
            <label>{copy.question}
              <textarea name="correction" rows={3} maxLength={3000} placeholder={copy.hint} required />
            </label>
            <label className="correction-opt-in"><input type="checkbox" name="marketingOptIn" />{correctionOptIn}</label>
          </fieldset>
          {error && <p className="correction-error" role="alert">{error}</p>}
          {sample && <p>This sample form is for preview only.</p>}
          <button className="button button-orange" type="submit" disabled={sending || sample}>{sending ? "Sending…" : copy.submit}</button>
        </form>}
      </div>
    </dialog>
  </>;
}
