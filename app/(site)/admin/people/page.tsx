"use client";
import "./people.css";
import { useEffect, useState } from "react";
import { portalRequest, type Assignment } from "@/lib/portal-request";
type Person = {
  id: string;
  email: string;
  created: string;
  lastSignIn?: string;
  info: Record<string, string>;
  approved: boolean;
  authorId: string;
};
type Doc = {
  _id: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
};
type Detail = {
  person: Person;
  authors: Doc[];
  stories: Doc[];
  events: { versions: Doc[] }[];
  listings: {
    id: string;
    draft: { name: string };
    contact: Record<string, unknown>;
    revision: number;
    status: string;
    profile_slug: string;
  }[];
  assignments: Assignment[] | null;
  assignmentError: boolean;
};
function studio(doc: Doc) {
  const id = doc._id.replace(/^drafts\./, "");
  return (
    <li key={doc._id}>
      <a
        className="text-link"
        href={
          "https://www.sanity.io/@oUcV9EK10/studio/tg2pib63zu890y3tcluji8jy/intent/edit/id=" +
          encodeURIComponent(id)
        }
        target="_blank"
        rel="noreferrer"
      >
        {doc.title || [doc.firstName, doc.lastName].join(" ")}
      </a>{" "}
      · {doc._id.startsWith("drafts.") ? "Draft" : "Published"}
    </li>
  );
}
export default function People() {
  const [page, setPage] = useState(1),
    [perPage, setPerPage] = useState(50),
    [loading, setLoading] = useState(true),
    [listError, setListError] = useState(""),
    [people, setPeople] = useState<Person[]>([]),
    [next, setNext] = useState(false),
    [id, setId] = useState(""),
    [detail, setDetail] = useState<Detail | null>(null),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false),
    [version, refresh] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setListError("");
    portalRequest(`/api/admin/people?page=${page}&perPage=${perPage}`)
      .then((d) => {
        if (active) {
          setPeople(d.people);
          setNext(!!d.next);
        }
      })
      .catch((e) => active && setListError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, perPage, version]);
  useEffect(() => {
    if (!id) return;
    let active = true;
    const path = "/api/admin/people?id=" + id;
    portalRequest(path)
      .then((d) => active && setDetail(d))
      .catch((e) => active && setMsg(e.message));
    const timer = setInterval(() => {
      if (document.hidden) return;
      portalRequest(path + "&progress=1")
        .then(
          (rows) =>
            active &&
            setDetail((d) =>
              d ? { ...d, assignments: rows, assignmentError: false } : d,
            ),
        )
        .catch(
          () =>
            active &&
            setDetail((d) => (d ? { ...d, assignmentError: true } : d)),
        );
    }, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id, version]);
  async function act(body: object) {
    setBusy(true);
    try {
      await portalRequest("/api/admin/people", { ...body, id });
      setMsg(
        (body as { action?: string }).action === "reset"
          ? "Password reset email requested."
          : "Saved.",
      );
      refresh((v) => v + 1);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="site-width page-content directory-owner people-workspace">
      <a href="/account">My account</a>
      <h1>People</h1>
      <p role="status">{msg}</p>
      <div>
        {!id ? (
          <section aria-label="Account directory" className="people-sheet">
            <div className="people-controls">
              <strong>
                {loading
                  ? "Loading accounts…"
                  : listError
                    ? "Accounts unavailable"
                    : people.length
                      ? `Accounts ${(page - 1) * perPage + 1}–${(page - 1) * perPage + people.length}`
                      : "No accounts"}
              </strong>
              <label>
                Rows per page{" "}
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {[50, 100, 250, 500].map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </select>
              </label>
              <button
                disabled={loading || page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                disabled={loading || !!listError || !next}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
            {listError && (
              <p role="alert">
                {listError}{" "}
                <button onClick={() => refresh((v) => v + 1)}>Retry</button>
              </p>
            )}
            <div className="people-scroll">
              <table aria-label="People">
                <thead>
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Business",
                      "City",
                      "Author",
                      "Joined",
                    ].map((h) => (
                      <th key={h} scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!loading &&
                    !listError &&
                    people.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <button
                            className="people-name"
                            onClick={() => {
                              setDetail(null);
                              setId(p.id);
                              setMsg("");
                            }}
                          >
                            {[p.info.firstName, p.info.lastName]
                              .filter(Boolean)
                              .join(" ") || p.email}
                          </button>
                        </td>
                        <td>{p.email}</td>
                        <td>{p.info.name || "—"}</td>
                        <td>{p.info.city || "—"}</td>
                        <td>{p.approved ? "Approved" : "—"}</td>
                        <td>
                          {new Date(p.created).toLocaleDateString("en-US")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <>
            <button
              disabled={busy}
              onClick={() => {
                setId("");
                setDetail(null);
                setMsg("");
              }}
            >
              ← Back to people
            </button>
            {!detail && !msg && <p role="status">Loading profile…</p>}
          </>
        )}
        {detail && (
          <article key={id}>
            <h2>{detail.person.email}</h2>
            <p>Joined {new Date(detail.person.created).toLocaleDateString()}</p>
            <form
              className="signup-card"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                act({
                  action: "profile",
                  email: f.get("email"),
                  info: Object.fromEntries(
                    Object.keys(detail.person.info).map((k) => [k, f.get(k)]),
                  ),
                  approved: f.has("approved"),
                  authorId: f.get("authorId"),
                });
              }}
            >
              <label>
                Account email
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={detail.person.email}
                />
              </label>
              {Object.entries(detail.person.info).map(([k, v]) => (
                <label key={k}>
                  {
                    {
                      firstName: "First name",
                      lastName: "Last name",
                      name: "Business name",
                      phone: "Phone",
                      city: "City",
                      zip: "ZIP",
                    }[k]
                  }
                  <input name={k} defaultValue={v} />
                </label>
              ))}
              <label>
                <input
                  type="checkbox"
                  name="approved"
                  defaultChecked={detail.person.approved}
                />{" "}
                Approved author
              </label>
              <label>
                Author profile
                <select name="authorId" defaultValue={detail.person.authorId}>
                  <option value="">Unlinked</option>
                  {detail.authors
                    .filter((a) => !a._id.startsWith("drafts."))
                    .map((a) => (
                      <option value={a._id} key={a._id}>
                        {a.firstName} {a.lastName}
                      </option>
                    ))}
                </select>
              </label>
              <button disabled={busy}>Save profile</button>
            </form>
            <button
              disabled={busy}
              onClick={() => {
                if (
                  confirm(
                    "Send a password reset to " + detail.person.email + "?",
                  )
                )
                  act({ action: "reset" });
              }}
            >
              Send password reset
            </button>
            <h3>Author profile and articles</h3>
            <ul>
              {detail.authors
                .filter(
                  (a) =>
                    a._id.replace(/^drafts\./, "") === detail.person.authorId,
                )
                .map(studio)}
              {detail.stories.map(studio)}
            </ul>
            <h3>Events</h3>
            <ul>{detail.events.flatMap((e) => e.versions).map(studio)}</ul>
            <h3>Directory listings</h3>
            {detail.listings.map((l) => (
              <details key={l.id}>
                <summary>
                  {l.draft.name} · {l.status}
                </summary>
                <form
                  className="signup-card"
                  key={l.revision}
                  onSubmit={(e) => {
                    e.preventDefault();
                    try {
                      const data = new FormData(e.currentTarget);
                      const fields = Object.fromEntries(
                        Object.entries({ ...l.draft, ...l.contact }).map(
                          ([key, value]) => {
                            if (typeof value === "boolean")
                              return [key, data.has(key)];
                            if (Array.isArray(value))
                              return [key, JSON.parse(String(data.get(key)))];
                            return [key, data.get(key) ?? value];
                          },
                        ),
                      );
                      act({
                        action: "listing",
                        listingId: l.id,
                        status: l.status,
                        revision: l.revision,
                        fields,
                      });
                    } catch {
                      setMsg(
                        "Check the format of the list fields before saving.",
                      );
                    }
                  }}
                >
                  {Object.entries({ ...l.draft, ...l.contact })
                    .filter(([key]) => key !== "email")
                    .map(([key, value]) => (
                      <label key={key} className="capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                        {typeof value === "boolean" ? (
                          <input
                            name={key}
                            type="checkbox"
                            defaultChecked={value}
                          />
                        ) : Array.isArray(value) ? (
                          <textarea
                            name={key}
                            defaultValue={JSON.stringify(value, null, 2)}
                          />
                        ) : key === "summary" ? (
                          <textarea
                            name={key}
                            defaultValue={String(value || "")}
                          />
                        ) : (
                          <input
                            name={key}
                            defaultValue={String(value ?? "")}
                          />
                        )}
                      </label>
                    ))}
                  <button disabled={busy}>
                    {l.status === "published"
                      ? "Update published listing"
                      : "Save listing"}
                  </button>
                </form>
              </details>
            ))}
            <h3>Assignments</h3>
            {detail.assignmentError && (
              <p role="status">Assignment updates unavailable.</p>
            )}
            {detail.assignments?.map((a) => (
              <details key={a.id}>
                <summary>
                  {a.title} ·{" "}
                  {a.submitted
                    ? "Submitted"
                    : Object.values(a.answers).filter(Boolean).length +
                      " of " +
                      a.questions.length +
                      " answered"}
                </summary>
                <dl>
                  {a.questions.map((q, i) => (
                    <div key={i}>
                      <dt>{q}</dt>
                      <dd>{a.answers[i] || "Awaiting answer"}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            ))}
            {detail.person.approved && (
              <form
                className="signup-card"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  act({
                    action: "assign",
                    title: f.get("title"),
                    questions: String(f.get("questions"))
                      .split("\n")
                      .map((q) => q.trim())
                      .filter(Boolean),
                  });
                }}
              >
                <label>
                  Assignment title
                  <input required name="title" />
                </label>
                <label>
                  Questions, one per line
                  <textarea required name="questions" />
                </label>
                <button disabled={busy}>Assign story</button>
              </form>
            )}
          </article>
        )}
      </div>
    </main>
  );
}
