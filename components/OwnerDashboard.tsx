"use client";
import { eligibleLocation, areaError } from "@/lib/directory/business-location";
import BusinessLocationFields from "./BusinessLocationFields";
import { descriptionLength, descriptionLimit } from "@/lib/directory/description";
import OperatingHoursFields from "./OperatingHoursFields";
import OperatingHours from "./OperatingHours";
import { defaultWeek, isWeek, hoursError, type DayHours } from "@/lib/directory/hours";
import MySubmissions from "./MySubmissions";
import SignupCard,{Completion} from "./SignupCard";
import {ServiceAreas} from "./ServiceAreas";
import { allOfGwinnett, formatServiceAreas, serviceAreaCities } from "@/lib/directory/locations";
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
  providerType: "",
  category: "",
  categories: [] as string[],
  services: [] as string[],
  neighborhood: allOfGwinnett,
  address: "", streetAddress: "", city: "", zip: "", businessPhone: "",
  hideAddress: true, hidePhone: true,
  summary: "",
  publicEmail: "",
  publicPhone: "",
  url: "",
  social: "",
  booking: "",
  hours: "",
  weeklyHours: defaultWeek() as DayHours[] | null,
  logo: "",
  gallery: [] as string[],
};
type Draft = typeof blank;
type Row = {
  id: string;
  revision: number;
  status: string;
  review_note: string;
  profilePath?: string | null;
  deletion_due_at: string | null;
  contact: Partial<Draft>;
  draft: Partial<Draft>;
};
type Removal = {id: string; name: string; deletion_due_at: string};
const dueDate = (value: string) => new Date(value).toLocaleString("en-US", {dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York"}) + " ET";
function restoreDraft(saved: Partial<Draft>): Draft {
  const weeklyHours = isWeek(saved.weeklyHours) ? saved.weeklyHours : saved.hours ? null : defaultWeek();
  const neighborhood = formatServiceAreas(serviceAreaCities(saved.neighborhood ?? allOfGwinnett));
  return {...blank, ...saved, weeklyHours, neighborhood, streetAddress: saved.streetAddress ?? saved.address ?? "",
    businessPhone: saved.businessPhone || saved.publicPhone || saved.phone || "",
    hideAddress: saved.hideAddress ?? !saved.address, hidePhone: saved.hidePhone ?? !saved.publicPhone};
}
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
    [deletions, setDeletions] = useState<Removal[]>([]),
    [queue, setQueue] = useState<Row[]>([]);
  const [form, setForm] = useState<Draft | null>(null),
    [checkout, setCheckout] = useState<{id: string; url?: string} | null>(null),
    [uploadIssue, setUploadIssue] = useState<{field: "logo" | "gallery"; message: string} | null>(null),
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
    if (res.status === 403 && path === "progress")
      throw Error("We couldn’t verify this draft save. Your entries are still here. Please try again.");
    if (!res.ok) throw Error(out.error || "Please try again.");
    return out;
  }
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0);
  async function refresh() {
    const data = await api("owner");
    setRows(data.rows); setDeletions(data.deletions || []);
    setProgress(data.progress);
    setQueue(data.moderator ? await api("review") : []);
  }
  useEffect(() => {
    let active = true;
    if (!session) {
      setLoaded(false);setProgress([]);setRows([]);
      setQueue([]);setDeletions([]);
      setForm(null);setCheckout(null);setUploadIssue(null);
      return;
    }
    api("owner")
      .then(async (data) => {
        if (!active) return;
        setRows(data.rows); setDeletions(data.deletions || []);setProgress(data.progress);setLoaded(true);
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
  function resume(saved:Progress){setUploadIssue(null);setForm(restoreDraft(saved.fields));setStep(saved.step);setMsg("")}
  function edit(row?: Row) {
    setUploadIssue(null);
    const existing=row&&progress.find(p=>p.listing_id===row.id&&p.fields.revision===row.revision);
    if(existing){resume(existing);return}
    const m=session?.user.user_metadata||{};
    let locationHint: {city?: string; zip?: string} = {};
    try { locationHint = JSON.parse(sessionStorage.getItem("atg-directory-location") || "{}") || {}; } catch {}
    setForm(
      row
        ? restoreDraft({
            ...row.contact,
            ...row.draft,
            id: row.id,listingId:row.id,
            revision: row.revision,
            status: row.status,
          })
        : { ...blank,listingId:crypto.randomUUID(),firstName:m.firstName||m.given_name||"",lastName:m.lastName||m.family_name||"",phone:m.phone||"",name:m.businessName||"",city:m.city||locationHint.city||"",zip:m.zip||locationHint.zip||"" },
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
      setUploadIssue(null);
      try {
        if (!file.size || file.size > 2_000_000) throw Error("Choose a JPG, PNG, or WebP file of 2 MB or less.");
        const data = new FormData();
        data.set("file", file);
        const out = await api("upload", data);
        change(k, k === "logo" ? out.url : [...form.gallery, out.url]);
      } catch (error) {
        setUploadIssue({field: k, message: error instanceof Error ? error.message : "The upload failed. Please try again."});
      }
    });
  }
  async function openCheckout(id: string) {
    setCheckout({id});
    const {url} = await api("checkout", {id});
    if (!url) throw Error("Stripe Checkout couldn’t open. Please try again.");
    setCheckout({id, url});
    window.location.assign(url);
  }

  const descriptionCount = descriptionLength(form?.summary || "");
  const descriptionOver = descriptionCount > descriptionLimit;
  const descriptionBlocked = descriptionOver && (step === 0 || step === 4);

  async function submit(e: FormEvent) {
    e.preventDefault();
    await run(async()=>{
      if (descriptionBlocked) {
        setStep(0);
        throw Error("Shorten your business description to 1,000 characters or fewer.");
      }
      if ((step === 1 || step === 4) && (!form.streetAddress.trim() || !eligibleLocation(form.city, form.zip))) {
        setStep(1);
        throw Error(!form.streetAddress.trim() ? "Enter your business street address." : areaError);
      }
      if ((step === 1 || step === 4) && form.weeklyHours !== null) {
        const error = hoursError(form.weeklyHours);
        if (error) { setStep(1); throw Error(error); }
      }
      if(step===1 && !form.neighborhood?.trim()) throw Error("Select at least one city you serve.");
      if(step<4){await checkpoint(step+1);setStep(step+1);window.scrollTo({top:0,behavior:"smooth"});return}
      const result = await api("owner", form);
      setForm(null);
      if (!form.status || form.status === "unpaid") {
        await openCheckout(result.id);
        return;
      }
      await refresh();
      setMsg("Edits submitted for review.");
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
      {!form && !checkout && status}
      <h1>{checkout ? "Listing checkout" : form ? "Build your listing" : "My submissions"}</h1>
      <div className="owner-session">
        <span>Signed in as {session.user.email}</span>
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
      </div>
      {checkout ? (
        <section className="checkout-handoff" aria-label="Listing payment">
          <p>Your listing is saved.</p>
          {busy && <p role="status">Opening Stripe Checkout…</p>}
          {msg && <p role="alert" className="wizard-error">{msg}</p>}
          <div className="submission-actions">
            {checkout.url ? <a className="button button-orange" href={checkout.url}>Open Stripe Checkout</a>
              : !busy && <button className="primary-action" onClick={() => run(() => openCheckout(checkout.id))}>Retry checkout</button>}
            {!busy && <button type="button" onClick={() => run(async () => { await refresh(); setCheckout(null); })}>Back to my listings</button>}
          </div>
        </section>
      ) : !form ? (
        <>
          <section className="owner-submissions-section" aria-labelledby="directory-submissions">
          <div className="owner-section-heading">
            <h2 id="directory-submissions">Directory listings</h2>
            <div className="owner-section-controls">
              <button className="primary-action" onClick={() => edit()}>Add a listing</button>
              <button disabled={busy} onClick={() => {
                setEventsRefreshKey(key => key + 1);
                run(refresh);
              }}>Refresh status</button>
            </div>
          </div>
          {!rows.length && !progress.length && <p className="submission-status">No directory listings yet.</p>}
          {progress.filter(p=>!rows.some(r=>r.id===p.listing_id)).map(p=><article key={p.listing_id}>
            <OwnerListingHeading data={p.fields} />
            <Completion completed={p.step+1}/><p>Next up: {sections[p.step]}</p><button onClick={()=>resume(p)}>Continue listing</button>
          </article>)}
          {rows.map((r) => (
            <article key={r.id}>
              <OwnerListingHeading data={r.draft} href={r.profilePath} status={labels[r.status]} />
              {r.status==="unpaid"&&<Completion completed={sections.length+1}/>}
              {r.review_note && <p>{r.review_note}</p>}
              {r.deletion_due_at && <p>Hidden from the directory. Scheduled for deletion by {dueDate(r.deletion_due_at)}.</p>}
              <div className="owner-listing-actions">
                {r.deletion_due_at ? (
                  <button disabled={busy} onClick={() => run(async () => {
                    await api("deletion", {id:r.id, action:"cancel"}); await refresh();
                  })}>Cancel deletion request</button>
                ) : (
                  <>
                    <div className="owner-listing-links">
                      {r.profilePath && <a className="button button-orange" href={r.profilePath}>View public profile</a>}
                      <button onClick={() => edit(r)}>Edit listing</button>
                      {r.status === "unpaid" && (
                        <button disabled={busy} onClick={() => run(() => openCheckout(r.id))}>Continue to checkout</button>
                      )}
                    </div>
                    <button className="request-deletion" disabled={busy} onClick={() => {
                      if (window.confirm("Request deletion of " + r.draft.name + "? The profile will be hidden now. ATG can approve deletion sooner, or it will be deleted automatically after 14 days.")) {
                        run(async () => { await api("deletion", {id:r.id, action:"request"}); await refresh(); });
                      }
                    }}>Request profile deletion</button>
                  </>
                )}
              </div>
            </article>
          ))}
          </section>
          <MySubmissions key={session.user.id} session={session} refreshKey={eventsRefreshKey} />
          {deletions.length > 0 && <section>
            <h2>Profile deletion requests</h2>
            {deletions.map(item => <article key={item.id}><h3>{item.name}</h3>
              <p>Automatic deletion by {dueDate(item.deletion_due_at)}.</p>
              <button disabled={busy} onClick={() => {
                if (window.confirm("Permanently delete " + item.name + " now?")) {
                  run(async () => { await api("deletion", {id:item.id, action:"approve"}); await refresh(); });
                }
              }}>Approve deletion now</button>
            </article>)}
          </section>}
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
                  <div className="submission-actions">
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
                  </div>
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
                {descriptionOver && <p className="description-count" data-over="true">
                  Your description exceeds 1,000 characters.{" "}
                  <button type="button" onClick={() => setStep(0)}>Edit description</button>
                </p>}

              </>
            ) : (
              <>
                {step===0&&<><details open={!form.firstName||!form.lastName||!form.phone}><summary>Private listing contact</summary>
                {field("firstName", "First name", true)}
                {field("lastName", "Last name", true)}
                {field("phone", "Phone number", true, "tel")}
                <p>Email · {session.user.email}</p>
                </details>
                <fieldset><legend>Who are you creating this listing for?</legend>
                  <label><input type="radio" name="providerType" required checked={form.providerType==="independent"} onChange={()=>change("providerType","independent")}/> Myself · Customers hire me directly, even if I use a business name.</label>
                  <label><input type="radio" name="providerType" required checked={form.providerType==="organization"} onChange={()=>change("providerType","organization")}/> A business, team, or organization · This listing represents the organization.</label>
                </fieldset>
                {field("name", "Public listing name", true)}
                <label htmlFor="business-description">Business description
                  <textarea id="business-description" required value={form.summary}
                    aria-invalid={descriptionOver} aria-describedby="business-description-count"
                    onChange={e => change("summary", e.target.value)} />
                </label>
                <p id="business-description-count" className="description-count" data-over={descriptionOver}>
                  {descriptionCount.toLocaleString("en-US")} / {descriptionLimit.toLocaleString("en-US")} characters
                  {descriptionOver && " · Shorten your description to continue."}
                </p>
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
                {field("streetAddress", "Business street address (required)", true)}
                <BusinessLocationFields city={form.city} zip={form.zip} onChange={change} />
                <label><input type="checkbox" checked={form.hideAddress}
                  onChange={e => change("hideAddress", e.target.checked)} />Hide address on profile</label>
                <OperatingHoursFields week={form.weeklyHours} legacy={form.hours}
                  onChange={week => change("weeklyHours", week)} />
                </>}{step===2&&<>
                <label><input type="checkbox" checked={form.hidePhone}
                  onChange={e => setForm(current => current && ({...current, hidePhone:e.target.checked,
                    businessPhone: current.businessPhone || current.phone}))} />Hide phone number on profile</label>
                {!form.hidePhone && field("businessPhone", "Business phone shown on profile", true, "tel")}
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
                    {uploadIssue?.field === k && <p role="alert" className="wizard-error">{uploadIssue.message}</p>}
                    <div className="upload-previews">{(k === "logo"
                      ? [form.logo].filter(Boolean)
                      : form.gallery
                    ).map((src, index) => (
                      <div className="upload-preview" key={src}>
                        <img
                          src={src}
                          alt={k === "logo" ? "Uploaded logo" : "Work photo " + (index + 1)}
                          width={80}
                          height={80}
                        />
                        <button
                          type="button"
                          aria-label={k === "logo" ? "Remove logo" : "Remove work photo " + (index + 1)}
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
                      </div>
                    ))}</div>
                  </section>
                ))}</>}
              </>
            )}
            {msg && <p className="wizard-error" role="alert">{msg}</p>}
            {step===4 && (!form.status || form.status==="unpaid") && <p className="checkout-note">The one-time listing fee is $3. You can enter a promotion code at Stripe Checkout. ATG reviews submissions before publication. For billing or review questions, <a href="/contact">contact ATG</a>.</p>}
            <div className="wizard-actions">{step>0&&<button type="button" onClick={()=>{setMsg("");setStep(step-1)}}>Back</button>}
              <button className="primary-action" disabled={busy || descriptionBlocked}>{busy ? "Saving…" : step < 4 ? "Next" : form.status && form.status !== "unpaid" ? "Submit edits for review" : "Continue to Stripe Checkout · $3"}</button>
              <button type="button" className="text-action" onClick={()=>run(async()=>{await checkpoint(step);await refresh();setForm(null);setMsg("Draft saved. You can finish it later.")})}>Save and exit</button></div>
          </fieldset>
        </form>
      )}
    </>
  );
}
function OwnerListingHeading({data, href, status}: {data: Partial<Draft>; href?: string | null; status?: string}) {
  const name = data.name || "New listing";
  return <header className="owner-listing-heading">
    {data.logo && <img src={data.logo} alt="" width={56} height={56} />}
    <div>
      <h3>{href ? <a href={href}>{name}</a> : name}</h3>
      {status && <p>{status}</p>}
    </div>
  </header>;
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
        d.hideAddress ? "" : (d.streetAddress ? [d.streetAddress, d.city, "GA " + d.zip].join(", ") : d.address),
        d.hidePhone ? "" : d.businessPhone || d.publicPhone,
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
      <OperatingHours week={d.weeklyHours} legacy={d.hours} />
      {d.gallery?.map((src) => (
        <img key={src} src={src} alt="Work sample" width={100} />
      ))}
    </article>
  );
}
