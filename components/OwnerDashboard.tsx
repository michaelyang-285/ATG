"use client";
import { useEffect, useState, FormEvent } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import { categories, services } from "@/lib/directory/categories";
const blank = {
  id: "",
  revision: 0,
  status: "",
  firstName: "",
  lastName: "",
  phone: "",
  name: "",
  category: "",
  categories: [] as string[],
  services: [] as string[],
  neighborhood: "",
  address: "",
  summary: "",
  publicEmail: "",
  publicPhone: "",
  url: "",
  social: "",
  booking: "",
  hours: "",
  logo: "",
  gallery: [] as string[],
};
type Draft = typeof blank;
type Row = {
  id: string;
  revision: number;
  status: string;
  review_note: string;
  contact: Partial<Draft>;
  draft: Partial<Draft>;
};
const labels: Record<string, string> = {
  unpaid: "Awaiting $3 payment",
  review: "In review",
  published: "Published",
  changes: "Changes requested",
  declined: "Declined",
};
export default function OwnerDashboard() {
  const [client] = useState(() =>
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        )
      : null,
  );
  const [session, setSession] = useState<Session | null>(null),
    [email, setEmail] = useState(""),
    [rows, setRows] = useState<Row[]>([]),
    [queue, setQueue] = useState<Row[]>([]);
  const [form, setForm] = useState<Draft | null>(null),
    [preview, setPreview] = useState(false),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false),
    [notes, setNotes] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!client) return;
    const { data } = client.auth.onAuthStateChange((_, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [client]);
  async function api(path: string, body?: unknown) {
    const file = body instanceof FormData;
    const res = await fetch("/api/directory/" + path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        ...(session ? { Authorization: "Bearer " + session.access_token } : {}),
        ...(file ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : file ? body : JSON.stringify(body),
      cache: "no-store",
    });
    const out = await res.json();
    if (!res.ok) throw Error(out.error || "Please try again.");
    return out;
  }
  async function refresh() {
    const data = await api("owner");
    setRows(data.rows);
    setQueue(data.moderator ? await api("review") : []);
  }
  useEffect(() => {
    let active = true;
    if (!session) {
      setRows([]);
      setQueue([]);
      setForm(null);
      return;
    }
    api("owner")
      .then(async (data) => {
        if (!active) return;
        setRows(data.rows);
        if (data.moderator) {
          const q = await api("review");
          if (active) setQueue(q);
        }
      })
      .catch((e) => {
        if (active) setMsg(e.message);
      });
    return () => {
      active = false;
    };
  }, [session?.access_token]);
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setMsg("");
    try {
      await fn();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }
  function edit(row?: Row) {
    setForm(
      row
        ? {
            ...blank,
            ...row.contact,
            ...row.draft,
            id: row.id,
            revision: row.revision,
            status: row.status,
          }
        : { ...blank },
    );
    setPreview(false);
    setMsg("");
  }
  function change(k: keyof Draft, v: unknown) {
    setForm((f) => f && { ...f, [k]: v });
  }
  function field(
    k: keyof Draft,
    label: string,
    required = false,
    type = "text",
  ) {
    return (
      <label>
        {label}
        <input
          type={type}
          required={required}
          value={String(form[k])}
          maxLength={type === "url" ? 1000 : 240}
          onChange={(e) => change(k, e.target.value)}
        />
      </label>
    );
  }
  function toggle(k: "services" | "categories", v: string) {
    change(
      k,
      form[k].includes(v) ? form[k].filter((x) => x !== v) : [...form[k], v],
    );
  }
  function upload(file: File, k: "logo" | "gallery") {
    run(async () => {
      const data = new FormData();
      data.set("file", file);
      const out = await api("upload", data);
      change(k, k === "logo" ? out.url : [...form.gallery, out.url]);
    });
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!preview) {
      setPreview(true);
      return;
    }
    await run(async () => {
      await api("owner", form);
      setForm(null);
      await refresh();
      setMsg(
        form.status && form.status !== "unpaid"
          ? "Edits submitted for review."
          : "Listing saved. Complete the $3 payment below.",
      );
    });
  }
  const status = <p aria-live="polite">{msg}</p>;
  if (!client)
    return <p>Directory signup is being set up. Please check back soon.</p>;
  if (!session)
    return (
      <>
        <p>
          Sign in by email to add or update a Gwinnett listing. New listings
          cost $3 once. Edits are free.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await api("login", { email });
              setMsg("Check your email for a sign-in link.");
            });
          }}
        >
          <label>
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button disabled={busy}>Email me a sign-in link</button>
        </form>
        {status}
      </>
    );
  return (
    <>
      {status}
      <p>
        Signed in as {session.user.email} ·{" "}
        <button
          disabled={busy}
          onClick={() =>
            run(async () => {
              const { error } = await client.auth.signOut();
              if (error) throw error;
            })
          }
        >
          Sign out
        </button>
      </p>
      {!form ? (
        <>
          <button onClick={() => edit()}>Add a listing</button>{" "}
          <button disabled={busy} onClick={() => run(refresh)}>
            Refresh status
          </button>
          {rows.map((r) => (
            <article key={r.id}>
              <h2>{r.draft.name}</h2>
              <p>{labels[r.status]}</p>
              {r.review_note && <p>{r.review_note}</p>}
              <button onClick={() => edit(r)}>Edit listing</button>{" "}
              {r.status === "unpaid" && (
                <button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const out = await api("checkout", { id: r.id });
                      window.location.assign(out.url);
                    })
                  }
                >
                  Pay $3 and submit
                </button>
              )}
            </article>
          ))}
          {queue.length > 0 && (
            <section>
              <h2>Review submissions</h2>
              {queue.map((r) => (
                <article key={r.id}>
                  <ListingPreview data={r.draft} />
                  <label>
                    Feedback for owner
                    <textarea
                      value={notes[r.id] || ""}
                      onChange={(e) =>
                        setNotes({ ...notes, [r.id]: e.target.value })
                      }
                    />
                  </label>
                  {["published", "changes", "declined"].map((s, i) => (
                    <button
                      key={s}
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          await api("review", {
                            id: r.id,
                            revision: r.revision,
                            status: s,
                            note: notes[r.id] || "",
                          });
                          await refresh();
                        })
                      }
                    >
                      {["Approve", "Request changes", "Decline"][i]}
                    </button>
                  ))}
                </article>
              ))}
            </section>
          )}
        </>
      ) : (
        <form onSubmit={submit}>
          <fieldset disabled={busy}>
            {preview ? (
              <>
                <h2>Public listing preview</h2>
                <ListingPreview data={form} />
                <button type="button" onClick={() => setPreview(false)}>
                  Back to editing
                </button>
              </>
            ) : (
              <>
                <h2>Your private contact information</h2>
                {field("firstName", "First name", true)}
                {field("lastName", "Last name", true)}
                {field("phone", "Phone number", true, "tel")}
                <p>Email · {session.user.email}</p>
                <h2>Public listing</h2>
                {field("name", "Business, organization, or working name", true)}
                <label>
                  Description
                  <textarea
                    required
                    maxLength={2000}
                    value={form.summary}
                    onChange={(e) => change("summary", e.target.value)}
                  />
                </label>
                <label>
                  Primary category
                  <select
                    required
                    value={form.category}
                    onChange={(e) => change("category", e.target.value)}
                  >
                    <option value="">Choose a category</option>
                    {Object.entries(categories).map(([group, items]) => (
                      <optgroup key={group} label={group}>
                        {items.map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <details>
                  <summary>
                    Additional categories ({form.categories.length})
                  </summary>
                  {Object.entries(categories).map(([group, items]) => (
                    <fieldset key={group}>
                      <legend>{group}</legend>
                      {items
                        .filter((v) => v !== form.category)
                        .map((v) => (
                          <label key={v}>
                            <input
                              type="checkbox"
                              checked={form.categories.includes(v)}
                              onChange={() => toggle("categories", v)}
                            />
                            {v}
                          </label>
                        ))}
                    </fieldset>
                  ))}
                </details>
                <fieldset>
                  <legend>Service options</legend>
                  {services.map((v) => (
                    <label key={v}>
                      <input
                        type="checkbox"
                        checked={form.services.includes(v)}
                        onChange={() => toggle("services", v)}
                      />
                      {v === "Mobile" ? "Mobile · I travel to customers" : v}
                    </label>
                  ))}
                </fieldset>
                {field("neighborhood", "Cities or areas served", true)}
                {field("address", "Public street address (optional)")}
                {field("hours", "Hours or appointment availability")}
                {field("publicPhone", "Public phone", false, "tel")}
                <label>
                  <input
                    type="checkbox"
                    checked={!!form.phone && form.publicPhone === form.phone}
                    onChange={(e) =>
                      change("publicPhone", e.target.checked ? form.phone : "")
                    }
                  />
                  Use my phone publicly
                </label>
                {field("publicEmail", "Public email", false, "email")}
                <label>
                  <input
                    type="checkbox"
                    checked={form.publicEmail === session.user.email}
                    onChange={(e) =>
                      change(
                        "publicEmail",
                        e.target.checked ? session.user.email : "",
                      )
                    }
                  />
                  Use my email publicly
                </label>
                {field("url", "Website", false, "url")}
                {field("booking", "Booking or ordering link", false, "url")}
                {field("social", "Social profile", false, "url")}
                {(["logo", "gallery"] as const).map((k) => (
                  <section key={k}>
                    <label>
                      {k === "logo"
                        ? "Logo or profile photo"
                        : "Photos of your work (up to six)"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={k === "gallery" && form.gallery.length >= 6}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) upload(f, k);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {(k === "logo"
                      ? [form.logo].filter(Boolean)
                      : form.gallery
                    ).map((src) => (
                      <span key={src}>
                        <img
                          src={src}
                          alt="Upload preview"
                          width={80}
                          height={80}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            change(
                              k,
                              k === "logo"
                                ? ""
                                : form.gallery.filter((v) => v !== src),
                            )
                          }
                        >
                          Remove
                        </button>
                      </span>
                    ))}
                  </section>
                ))}
              </>
            )}
            <button>
              {preview
                ? form.status && form.status !== "unpaid"
                  ? "Submit edits for review"
                  : "Save listing and continue"
                : "Preview listing"}
            </button>{" "}
            <button type="button" onClick={() => setForm(null)}>
              Cancel
            </button>
          </fieldset>
        </form>
      )}
    </>
  );
}
function ListingPreview({ data: d }: { data: Partial<Draft> }) {
  return (
    <article>
      {d.logo ? (
        <img src={d.logo} alt="" width={80} height={80} />
      ) : (
        <strong>
          {d.name
            ?.split(/\s+/)
            .slice(0, 2)
            .map((v) => v[0])
            .join("")}
        </strong>
      )}
      <h3>{d.name}</h3>
      <p>
        {[d.category, ...(d.categories || []), ...(d.services || [])]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <p>{d.summary}</p>
      {[
        d.neighborhood,
        d.address,
        d.hours,
        d.publicPhone,
        d.publicEmail,
        d.url,
        d.booking,
        d.social,
      ]
        .filter(Boolean)
        .map((v, i) => (
          <p key={i}>{v}</p>
        ))}
      {d.gallery?.map((src) => (
        <img key={src} src={src} alt="Work sample" width={100} />
      ))}
    </article>
  );
}
