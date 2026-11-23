"use client";
import { useEffect, useState } from "react";
import { portalRequest, type Assignment } from "@/lib/portal-request";
export default function Assignments() {
  const [rows, setRows] = useState<Assignment[]>([]),
    [message, setMessage] = useState("Loading assignments…");
  useEffect(() => {
    portalRequest("/api/assignments")
      .then((data) => {
        setRows(data);
        setMessage(data.length ? "" : "No assignments yet.");
      })
      .catch((e) => setMessage(e.message));
  }, []);
  const [busy, setBusy] = useState(false);
  async function save(row: Assignment, change: object) {
    setBusy(true);
    try {
      const updated = await portalRequest("/api/assignments", {
        id: row.id,
        revision: row.revision,
        ...change,
      });
      setRows((old) => old.map((r) => (r.id === row.id ? updated : r)));
      setMessage("Saved.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="site-width page-content directory-owner">
      <a href="/directory/manage">My account</a>
      <h1>My assignments</h1>
      <p role="status">{message}</p>
      {rows.map((row) => (
        <section className="signup-card" key={row.id}>
          <h2>{row.title}</h2>
          {row.questions.map((q, i) => (
            <form
              key={i}
              onSubmit={(e) => {
                e.preventDefault();
                save(row, {
                  index: i,
                  answer: new FormData(e.currentTarget).get("answer"),
                });
              }}
            >
              <label>
                {q}
                <textarea
                  name="answer"
                  defaultValue={row.answers[i]}
                  disabled={row.submitted}
                />
              </label>
              {!row.submitted && <button disabled={busy}>Save answer</button>}
            </form>
          ))}
          {row.submitted ? (
            <p>Submitted for review</p>
          ) : (
            <button
              disabled={busy}
              onClick={() => {
                if (confirm("Submit your saved answers for review?"))
                  save(row, { submit: true });
              }}
            >
              Submit saved answers
            </button>
          )}
        </section>
      ))}
    </main>
  );
}
