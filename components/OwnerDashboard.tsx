"use client";
import MySubmissions from "./MySubmissions";
import SignupCard,{Completion} from "./SignupCard";
import {ServiceAreas} from "./ServiceAreas";
import { useEffect, useState, FormEvent } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import { categories, services } from "@/lib/directory/categories";
import {blankSocial, networks} from "@/lib/directory/social";
const blank = {
  ...blankSocial,
  listingId: "",
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
const sections=["Business basics","Service area","Contact & links","Photos","Review"];
type Progress={listing_id:string,step:number,fields:Draft};
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
    [step,setStep]=useState(0),
    [progress,setProgress]=useState<Progress[]>([]),
    [signin,setSignin]=useState(false),
    [sent,setSent]=useState(false),
    [googleEnabled,setGoogleEnabled]=useState(false),
    [loaded,setLoaded]=useState(false),
    [account,setAccount]=useState({firstName:"",lastName:"",phone:"",name:""}),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false),
    [notes, setNotes] = useState<Record<string, string>>({});
  useEffect(() => {
    setSignin(new URLSearchParams(location.search).get("mode")==="signin");
    if (new URLSearchParams(window.location.search).get("mode") === "signin") setSignin(true);
    if (!client) return;
    const controller = new AbortController();
    fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + "/auth/v1/settings", {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
      signal: controller.signal,
    }).then(response => response.ok ? response.json() : null)
      .then(settings => setGoogleEnabled(settings?.external?.google === true))
      .catch(() => {});
    const { data } = client.auth.onAuthStateChange((_, s) => setSession(s));
    return () => { controller.abort(); data.subscription.unsubscribe(); };
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
    setProgress(data.progress);
    setQueue(data.moderator ? await api("review") : []);
  }
  useEffect(() => {
    let active = true;
    if (!session) {
      setLoaded(false);setProgress([]);setRows([]);
      setQueue([]);
      setForm(null);
      return;
    }
    api("owner")
      .then(async (data) => {
        if (!active) return;
        setRows(data.rows);setProgress(data.progress);setLoaded(true);
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
  }, [session?.user.id]);
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
  function resume(saved:Progress){setForm(saved.fields);setStep(saved.step);setMsg("")}
  function edit(row?: Row) {
    const existing=row&&progress.find(p=>p.listing_id===row.id&&p.fields.revision===row.revision);
    if(existing){resume(existing);return}
    const m=session?.user.user_metadata||{};
    setForm(
      row
        ? {
            ...blank,
            ...row.contact,
            ...row.draft,
            id: row.id,listingId:row.id,
            revision: row.revision,
            status: row.status,
          }
        : { ...blank,listingId:crypto.randomUUID(),firstName:m.firstName||m.given_name||"",lastName:m.lastName||m.family_name||"",phone:m.phone||"",name:m.businessName||"" },
    );
    setStep(0);
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
    await run(async()=>{
      if(step===1 && !form.neighborhood?.trim()) throw Error("Select at least one city you serve.");
      if(step<4){await checkpoint(step+1);setStep(step+1);window.scrollTo({top:0,behavior:"smooth"});return}
      const result=await api("owner",form);
      setForm(null);await refresh();
      if(!form.status || form.status==="unpaid"){
        const checkout=await api("checkout",{id:result.id});
        window.location.assign(checkout.url);
      }else setMsg("Edits submitted for review.");
    });
  }
  async function checkpoint(next:number){
    await api("progress",{listingId:form.listingId,step:next,fields:form});
    setProgress(old=>[{listing_id:form.listingId,step:next,fields:form},...old.filter(p=>p.listing_id!==form.listingId)]);
  }
  const status = <p aria-live="polite">{msg}</p>;
  if (!client)
    return <p>Directory signup is being set up. Please check back soon.</p>;
  if (!session)
    return (
      <SignupCard {...{client,signin,setSignin,sent,setSent,email,setEmail,googleEnabled,busy,account,setAccount,status,setMsg,run}}
        sendEmail={()=>api("login",{email,...(signin?{}:{account})})}/>
    );
  if(!loaded)return <>{status}<p>Loading your listings…</p><button onClick={()=>location.reload()}>Reload</button></>;
  return (
    <>
      {status}
      <h1>{form?"Build your listing":"My submissions"}</h1>
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
          <section aria-labelledby="directory-submissions" style={{marginBlock:"2rem"}}>
          <h2 id="directory-submissions">Directory listings</h2>
          {!rows.length && !progress.length && <p>No directory listings yet.</p>}
          <button onClick={() => edit()}>Add a listing</button>{" "}
          <button disabled={busy} onClick={() => run(refresh)}>
            Refresh status
          </button>
          {progress.filter(p=>!rows.some(r=>r.id===p.listing_id)).map(p=><article key={p.listing_id}><h3>{p.fields.name||"New listing"}</h3><Completion completed={p.step+1}/><p>Next up: {sections[p.step]}</p><button onClick={()=>resume(p)}>Continue listing</button></article>)}
          {rows.map((r) => (
            <article key={r.id}>
              <h3>{r.draft.name}</h3>
              <p>{labels[r.status]}</p>{r.status==="unpaid"&&<Completion completed={sections.length+1}/>}
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
          </section>
          <MySubmissions key={session.user.id} session={session} />
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
        <form className="listing-wizard" onSubmit={submit}><Completion completed={step+1}/><h2>{sections[step]}</h2>
          <fieldset disabled={busy}>
            {step===4 ? (
              <>
                <p className="quiet">Here’s what neighbors will see in the directory.</p>
                <ListingPreview data={form} />

              </>
            ) : (
              <>
                {step===0&&<><details open={!form.firstName||!form.lastName||!form.phone}><summary>Private listing contact</summary>
                {field("firstName", "First name", true)}
                {field("lastName", "Last name", true)}
                {field("phone", "Phone number", true, "tel")}
                <p>Email · {session.user.email}</p>
                </details>
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
                    <option value="">Select your primary category</option>
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
                </>}{step===1&&<><fieldset>
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
                <ServiceAreas value={form.neighborhood} onChange={v=>change("neighborhood",v)}/>
                {field("address", "Public street address (optional)")}
                {field("hours", "Hours or appointment availability")}
                </>}{step===2&&<>
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
                <details><summary>Social profiles (optional)</summary>
                  {networks.map(({key,label})=><div key={key}>{field(key,label+" URL",false,"url")}</div>)}
                  {field("social","Other social profile",false,"url")}
                </details>
                </>}{step===3&&<><p>Logo and photos are optional. Choose a JPG, PNG, or WebP up to 2 MB.</p>
                {(["logo", "gallery"] as const).map((k) => (
                  <section key={k} className="upload-panel">
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
                ))}</>}
              </>
            )}
            <div className="wizard-actions">{step>0&&<button type="button" onClick={()=>setStep(step-1)}>Back</button>}
              {step===4 && (!form.status || form.status==="unpaid") && <p>The one-time $3 listing fee helps prevent spam. ATG reviews submissions before publication. For billing or review questions, <a href="/contact">contact ATG</a>.</p>}
              <button className="primary-action">{busy?"Saving…":step<4?"Next":form.status&&form.status!=="unpaid"?"Submit edits for review":"Continue to payment · $3"}</button>
              <button type="button" className="text-action" onClick={()=>run(async()=>{await checkpoint(step);await refresh();setForm(null);setMsg("Draft saved. You can finish it later.")})}>Save and exit</button></div>
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
        ...networks.map(n=>d[n.key]),
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
