"use client";
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
function Completion({completed}:{completed:number}) {
  const total=sections.length+1;
  const percent=Math.round(100*completed/total);
  return <div className="listing-completion">
    <div><span>{completed===total?"Listing details complete":`Step ${completed+1} of ${total}`}</span><strong>{percent}% complete</strong></div>
    <progress aria-label="Listing setup completion" max={100} value={percent}>{percent}%</progress>
  </div>;
}
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
        if(!data.rows.length){
          if(data.progress.length===1)resume(data.progress[0]);
          else if(!data.progress.length && session.user.user_metadata?.firstName)edit();
        }
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
        : { ...blank,listingId:crypto.randomUUID(),firstName:m.firstName||"",lastName:m.lastName||"",phone:m.phone||"",name:m.businessName||m.name||"" },
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
      <section className="signup-layout"><aside className="signup-intro"><a href="/directory">← Directory</a>
      <h1>{signin?"Welcome back.":"Get listed in Gwinnett."}</h1><p>{signin?"Pick up where you left off or manage a published listing.":"Help neighbors find your business, services, or organization."}</p>
      <p className="fee-note">Free to create an account. The one-time $3 listing fee comes at the end.</p></aside>
      <div className="signup-card">{!signin&&<Completion completed={0}/>}{sent?<><h2>Check your inbox</h2><p>Open the link sent to <strong>{email}</strong> to continue.</p><button onClick={()=>setSent(false)}>Change email or resend</button></>:<>
      <h2>{signin?"Sign in":"Create your account"}</h2>
      {googleEnabled && <><style jsx>{`
        :global(.directory-owner) button.google-auth {
          display: inline-flex; align-items: center; justify-content: center; gap: 12px;
          min-height: 40px; padding: 0 12px; border: 1px solid #747775; border-radius: 4px;
          background: #fff; color: #1f1f1f; font: 500 14px/20px Roboto, Arial, sans-serif;
          letter-spacing: .25px; cursor: pointer;
        }
        :global(.directory-owner) button.google-auth:hover { background: #f8faff; }
        :global(.directory-owner) button.google-auth:focus-visible { outline: 2px solid #0b57d0; outline-offset: 2px; }
        :global(.directory-owner) button.google-auth:disabled { opacity: .6; cursor: wait; }
      `}</style><button className="google-auth" type="button" disabled={busy} onClick={()=>run(async()=>{
        const {error}=await client.auth.signInWithOAuth({provider:"google",options:{
          redirectTo:new URL("/directory/manage",window.location.origin).href,
          queryParams:{prompt:"select_account"},
          scopes:"openid email profile"
        }});
        if(error)throw error;
      })}>
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg><span>Continue with Google</span></button><p className="auth-divider">or use email</p></>}<form onSubmit={e=>{e.preventDefault();run(async()=>{await api("login",{email,...(signin?{}:{account})});setSent(true)})}}>
      <div className="account-grid">{([["firstName","First name","given-name","text"],["lastName","Last name","family-name","text"],["email","Email address","email","email"],["phone","Phone number","tel","tel"],["name","Business or organization name","organization","text"]] as const).filter(([k])=>!signin||k==="email").map(([k,label,auto,type])=><label key={k} className={k==="firstName"||k==="lastName"?"":"wide"}>{label}<input required autoComplete={auto} type={type} maxLength={k==="email"?254:240} value={k==="email"?email:account[k]} onChange={e=>k==="email"?setEmail(e.target.value):setAccount({...account,[k]:e.target.value})}/></label>)}</div>
      {!signin&&<p className="quiet">Your name, phone, and email stay private. You’ll choose public contact details later.</p>}
      <button className="primary-action" disabled={busy}>{busy?"Sending…":signin?"Email me a sign-in link":"Create account"}</button></form>
      <button className="text-action" onClick={()=>{setSignin(!signin);setMsg("")}}>{signin?"New here? Create an account":"Already have an account? Sign in"}</button></>}{status}</div></section>
    );
  const googleUser=session.user.identities?.some(identity=>identity.provider==="google");
  const meta=session.user.user_metadata || {};
  if(googleUser && loaded && !rows.length && !progress.length && !(meta.firstName && meta.lastName && meta.phone && meta.businessName)){
    return <section className="signup-card"><Completion completed={0}/><h1>Finish your account</h1>
      <p>Signed in with Google as <strong>{session.user.email}</strong>.{" "}
        <button type="button" className="text-action" disabled={busy} onClick={()=>run(async()=>{
          const {error}=await client.auth.signOut({scope:"local"});
          if(error) throw error;
          setSent(false);
          setSignin(true);
          setEmail("");
          setAccount({firstName:"",lastName:"",phone:"",name:""});
          setMsg("Signed out. Choose Continue with Google to use another account.");
        })}>Sign out</button>
      </p>
      <form onSubmit={e=>{e.preventDefault();const fields=new FormData(e.currentTarget);run(async()=>{
        const data=Object.fromEntries(["firstName","lastName","phone","businessName"].map(key=>[key,String(fields.get(key)||"").trim()]));
        if(Object.values(data).some(value=>!value)||data.phone.replace(/\D/g,"").length<7)throw Error("Enter your name, business name, and a valid phone number.");
        const result=await client.auth.updateUser({data});if(result.error)throw result.error;
        setSession({...session,user:result.data.user});
        setForm({...blank,listingId:crypto.randomUUID(),firstName:data.firstName,lastName:data.lastName,phone:data.phone,name:data.businessName});
      })}}>
        <label>First name<input name="firstName" autoComplete="given-name" maxLength={240} required defaultValue={meta.firstName||meta.given_name||""}/></label>
        <label>Last name<input name="lastName" autoComplete="family-name" maxLength={240} required defaultValue={meta.lastName||meta.family_name||""}/></label>
        <label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={240} required defaultValue={meta.phone||""}/></label>
        <label>Business or organization name<input name="businessName" autoComplete="organization" maxLength={240} required defaultValue={meta.businessName||""}/></label>
        <button className="primary-action" disabled={busy}>Next</button>{status}
      </form></section>
  }
  if(!loaded)return <>{status}<p>Loading your listings…</p><button onClick={()=>location.reload()}>Reload</button></>;
  return (
    <>
      {status}
      <h1>{form?"Build your listing":"Your listings"}</h1>
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
          {progress.filter(p=>!rows.some(r=>r.id===p.listing_id)).map(p=><article key={p.listing_id}><h2>{p.fields.name||"New listing"}</h2><Completion completed={p.step+1}/><p>Next up: {sections[p.step]}</p><button onClick={()=>resume(p)}>Continue listing</button></article>)}
          {rows.map((r) => (
            <article key={r.id}>
              <h2>{r.draft.name}</h2>
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
                {step===0&&<><details open={!form.firstName||!form.lastName||!form.phone}><summary>Private account details</summary>
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
