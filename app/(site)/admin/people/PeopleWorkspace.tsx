"use client";
import "./people.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminListingMediaHours from "@/components/AdminListingMediaHours";
import { useEffect, useState } from "react";
import { portalRequest, type Assignment } from "@/lib/portal-request";
type Person = {
  id: string;
  email: string;
  created: string;
  lastSignIn?: string;
  info: Record<string, string>;
  newsletter?: boolean;
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
export type PeopleQuery = Record<string, string | string[] | undefined>;
export default function People({
  id = "",
  query,
}: {
  id?: string;
  query: PeopleQuery;
}) {
  const router = useRouter();
  const page = Math.max(1, Number.parseInt(String(query.page), 10) || 1);
  const perPage = [50, 100, 250, 500].includes(Number(query.perPage))
    ? Number(query.perPage)
    : 50;
  const filter = ["accounts", "newsletter"].includes(String(query.filter))
    ? String(query.filter)
    : "all";
  const listQuery = (p = page, size = perPage, f = filter) =>
    new URLSearchParams({
      page: String(p),
      perPage: String(size),
      filter: f,
    }).toString();
  const listUrl = "/admin/people?" + listQuery();
  const [section, setSection] = useState("Overview");
  const [loading, setLoading] = useState(true),
    [listError, setListError] = useState(""),
    [people, setPeople] = useState<Person[]>([]),
    [selected, setSelected] = useState<Person | null>(null),
    [next, setNext] = useState(false),
    [detail, setDetail] = useState<Detail | null>(null),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false),
    [version, refresh] = useState(0);
  useEffect(() => {
    let active = true;
    if (id) return;
    setLoading(true);
    setListError("");
    portalRequest(
      `/api/admin/people?page=${page}&perPage=${perPage}&filter=${filter}`,
    )
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
  }, [id, page, perPage, filter, version]);
  useEffect(() => {
    if (!id) return;
    let active = true;
    const path = "/api/admin/people?id=" + encodeURIComponent(id);
    portalRequest(path)
      .then((d) => {
        if (active) {
          if (d.subscriber) setSelected(d.subscriber);
          else setDetail(d);
        }
      })
      .catch((e) => active && setMsg(e.message));
    if (id.startsWith("newsletter:"))
      return () => {
        active = false;
      };
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
      <nav className="people-crumb" aria-label="Breadcrumb">
        <a href="/account">My account</a>
        <span>/</span>
        {id ? <Link href={listUrl}>People</Link> : <span>People</span>}
      </nav>
      <h1>
        {id
          ? [detail?.person.info.firstName, detail?.person.info.lastName]
              .filter(Boolean)
              .join(" ") ||
            detail?.person.email ||
            selected?.email ||
            "Person profile"
          : "People"}
      </h1>
      <p role="status">{msg}</p>
      <div>
        {!id ? (
          <section aria-label="Account directory" className="people-sheet">
            <div className="people-controls">
              <strong>
                {loading
                  ? "Loading people…"
                  : listError
                    ? "People unavailable"
                    : people.length
                      ? `People ${(page - 1) * perPage + 1}–${(page - 1) * perPage + people.length}`
                      : "No people yet"}
              </strong>
              <label>
                Show{" "}
                <select
                  value={filter}
                  onChange={(e) => {
                    router.replace(
                      "/admin/people?" + listQuery(1, perPage, e.target.value),
                      { scroll: false },
                    );
                  }}
                >
                  <option value="all">All people</option>
                  <option value="accounts">ATG accounts</option>
                  <option value="newsletter">Newsletter subscribers</option>
                </select>
              </label>
              <label>
                Rows per page{" "}
                <select
                  value={perPage}
                  onChange={(e) => {
                    router.replace(
                      "/admin/people?" + listQuery(1, Number(e.target.value)),
                      { scroll: false },
                    );
                  }}
                >
                  {[50, 100, 250, 500].map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </select>
              </label>
              <button
                disabled={loading || page === 1}
                onClick={() =>
                  router.replace("/admin/people?" + listQuery(page - 1), {
                    scroll: false,
                  })
                }
              >
                Previous
              </button>
              <button
                disabled={loading || !!listError || !next}
                onClick={() =>
                  router.replace("/admin/people?" + listQuery(page + 1), {
                    scroll: false,
                  })
                }
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
                      "Newsletter signup",
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
                          <Link
                            prefetch={false}
                            className="people-name"
                            href={
                              "/admin/people/" +
                              encodeURIComponent(p.id) +
                              "?" +
                              listQuery()
                            }
                          >
                            {[p.info.firstName, p.info.lastName]
                              .filter(Boolean)
                              .join(" ") || p.email}
                          </Link>
                        </td>
                        <td>{p.email}</td>
                        <td>{p.info.name || "—"}</td>
                        <td>{p.info.city || "—"}</td>
                        <td>{p.newsletter ? "Yes" : "—"}</td>
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
            {id.startsWith("newsletter:") && selected ? (
              <article>
                <h2>Newsletter subscriber</h2>
                <p>
                  Newsletter signup ·{" "}
                  {new Date(selected.created).toLocaleDateString("en-US")}
                </p>
                <p>
                  This contact will appear with their ATG account once they
                  verify the same email address.
                </p>
              </article>
            ) : (
              !detail && !msg && <p role="status">Loading profile…</p>
            )}
          </>
        )}
        {detail && (
          <article key={id}>
            <div className="profile-summary">
              <strong>{detail.person.email}</strong>
              <span>
                {detail.person.approved ? "Approved author" : "ATG account"}
              </span>
              {detail.person.newsletter && <span>Newsletter subscriber</span>}
              <span>
                Joined {new Date(detail.person.created).toLocaleDateString()}
              </span>
            </div>
            <nav className="profile-sections" aria-label="Profile sections">
              {Object.entries({
                Overview: null,
                Listings: detail.listings.length,
                Events: detail.events.length,
                Articles: detail.stories.length,
                Assignments: detail.assignmentError
                  ? null
                  : detail.assignments?.length,
              }).map(([label, count]) => (
                <button
                  type="button"
                  key={label}
                  aria-pressed={section === label}
                  onClick={() => setSection(label)}
                >
                  {label}
                  {count != null && <small>{count}</small>}
                </button>
              ))}
            </nav>
            <section hidden={section !== "Overview"}>
              <h2>Contact and account details</h2>
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
                        zip: "Business ZIP",
                        personalStreet: "Private street address",
                        personalUnit: "Apartment or suite",
                        personalCity: "Private city",
                        personalState: "Private state",
                        personalZip: "Private ZIP",
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
            </section>
            <section hidden={section !== "Articles"}>
              <h2>Author profile and articles</h2>
              {!detail.stories.length && <p>No linked articles.</p>}
              <ul>
                {detail.authors
                  .filter(
                    (a) =>
                      a._id.replace(/^drafts\./, "") === detail.person.authorId,
                  )
                  .map(studio)}
                {detail.stories.map(studio)}
              </ul>
            </section>
            <section hidden={section !== "Events"}>
              <h2>Events</h2>
              {!detail.events.length && <p>No event submissions.</p>}
              <ul>{detail.events.flatMap((e) => e.versions).map(studio)}</ul>
            </section>
            <section hidden={section !== "Listings"}>
              <h2>Directory listings</h2>
              {!detail.listings.length && <p>No directory listings.</p>}
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
                          fields: {
                            ...fields,
                            logo: String(data.get("logo") || ""),
                            services: JSON.parse(String(data.get("services"))),
                            gallery: JSON.parse(String(data.get("gallery"))),
                            weeklyHours: JSON.parse(
                              String(data.get("weeklyHours")),
                            ),
                          },
                        });
                      } catch {
                        setMsg(
                          "Check the format of the list fields before saving.",
                        );
                      }
                    }}
                  >
                    {Object.entries({ ...l.draft, ...l.contact })
                      .filter(
                        ([key]) =>
                          ![
                            "email",
                            "gallery",
                            "weeklyHours",
                            "hours",
                            "logo",
                            "services",
                          ].includes(key),
                      )
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
                    <AdminListingMediaHours
                      listingId={l.id}
                      draft={l.draft}
                      onUpload={setBusy}
                    />
                    <button disabled={busy}>
                      {l.status === "published"
                        ? "Update published listing"
                        : "Save listing"}
                    </button>
                  </form>
                </details>
              ))}
            </section>
            <section hidden={section !== "Assignments"}>
              <h2>Assignments</h2>
              {!detail.assignmentError && !detail.assignments?.length && (
                <p>No assignments yet.</p>
              )}
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
            </section>
          </article>
        )}
      </div>
    </main>
  );
}
