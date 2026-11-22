"use client";
import { eligibleLocation, areaError } from "@/lib/directory/business-location";
import BusinessLocationFields from "./BusinessLocationFields";
import { descriptionLength, descriptionLimit } from "@/lib/directory/description";
import { galleryLimit, sourceImageLimit } from "@/lib/directory/gallery";
import { prepareDirectoryImage } from "@/lib/directory/prepare-image";
import { directoryThumbnail } from "@/lib/directory/thumbnail";
import OperatingHoursFields from "./OperatingHoursFields";
import ListingPreview from "./ListingPreview";
import { defaultWeek, isWeek, hoursError, type DayHours } from "@/lib/directory/hours";
import MySubmissions from "./MySubmissions";
import ApprovalNotifications from "./ApprovalNotifications";
import SignupCard,{Completion} from "./SignupCard";
import {ServiceAreas} from "./ServiceAreas";
import { allOfGwinnett, formatServiceAreas, serviceAreaCities } from "@/lib/directory/locations";
import { useEffect, useState, FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { additionalCategories, additionalCategoryError, additionalCategoryLimit, categories, services } from "@/lib/directory/categories";
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
  publicPhone: "",
  url: "",
  social: "",
  booking: "",
  hours: "",
  weeklyHours: defaultWeek() as DayHours[] | null,
  logo: "",
  gallery: [] as string[],
};
export type Draft = typeof blank;
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
const dueDate = (value: string) => new Date(value).toLocaleString("en-US", {dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York"}) + " ET";
function restoreDraft(saved: Partial<Draft>): Draft {
  const weeklyHours = isWeek(saved.weeklyHours) ? saved.weeklyHours : saved.hours ? null : defaultWeek();
  const neighborhood = formatServiceAreas(serviceAreaCities(saved.neighborhood ?? allOfGwinnett));
  const knownCategories = Object.values(categories).flat();
  const selected = Array.isArray(saved.categories) ? saved.categories.filter(c => knownCategories.includes(c)) : [];
  return {...blank, ...saved, categories: additionalCategories(saved.category, selected), weeklyHours, neighborhood, streetAddress: saved.streetAddress ?? saved.address ?? "",
    businessPhone: saved.businessPhone || saved.publicPhone || saved.phone || "",
    hideAddress: saved.hideAddress ?? !saved.address, hidePhone: saved.hidePhone ?? !saved.publicPhone};
}
const listingTypes = [
  { value: "independent", label: "Myself", description: "Customers hire me directly, even if I use a business name." },
  { value: "organization", label: "A business or organization", description: "I’m listing a company, team, or community group." },
];

const sections=["Business basics","Service area","Contact & links","Photos","Review"];
type Progress={listing_id:string,step:number,fields:Draft};
const labels: Record<string, string> = {
  unpaid: "Awaiting $3 payment",
  review: "In review",
  published: "Published",
  changes: "Changes requested",
  declined: "Declined",
};
import { browserClient } from "@/lib/browser-client";
export default function OwnerDashboard() {
  const [client] = useState(browserClient);
  const [session, setSession] = useState<Session | null>(null),
    [email, setEmail] = useState(""),
    [rows, setRows] = useState<Row[]>([]),
    [canOpenQueue, setCanOpenQueue] = useState(false);
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
    [busy, setBusy] = useState(false);
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
  const [refreshKey, setRefreshKey] = useState(0);
  async function refresh() {
    const data = await api("owner");
    setRows(data.rows); setCanOpenQueue(data.canOpenQueue);
    setProgress(data.progress);
    setRefreshKey(key => key + 1);
  }
  useEffect(() => {
    let active = true;
    if (!session) {
      setLoaded(false);setProgress([]);setRows([]);
      setCanOpenQueue(false);
      setForm(null);setCheckout(null);setUploadIssue(null);
      return;
    }
    api("owner")
      .then((data) => {
        if (!active) return;
        setRows(data.rows); setCanOpenQueue(data.canOpenQueue);setProgress(data.progress);setLoaded(true);
        if (new URLSearchParams(location.search).get("next") === "approvals")
          location.replace("/admin/approvals");
      })
      .catch((e) => {
        if (active) setMsg(e.message);
      });
    return () => {
      active = false;
    };
  }, [session?.user.id]);
  useEffect(() => {
    const accessToken = session?.access_token;
    if (!accessToken || new URLSearchParams(window.location.search).get("payment") !== "returned")
      return;

    let listingId: string | null;
    try {
      listingId = sessionStorage.getItem("atg-directory-checkout");
    } catch {
      return;
    }
    if (!listingId) return;

    const controller = new AbortController();
    fetch("/api/directory/checkout?" + new URLSearchParams({ id: listingId }), {
      headers: { Authorization: "Bearer " + accessToken },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async response => {
        if (!response.ok || !(await response.json()).completed || controller.signal.aborted) return;
        const { gtag } = window as Window & {
          gtag?: (command: "event", name: string, params: { value: number; currency: string }) => void;
        };
        if (typeof gtag !== "function" || sessionStorage.getItem("atg-directory-checkout") !== listingId)
          return;

        const trackedKey = "atg-directory-signup:" + listingId;
        try {
          if (localStorage.getItem(trackedKey)) {
            sessionStorage.removeItem("atg-directory-checkout");
            return;
          }
          localStorage.setItem(trackedKey, "1");
        } catch {
          // Session storage still prevents a repeat in this tab.
        }
        sessionStorage.removeItem("atg-directory-checkout");
        gtag("event", "directory_signup", { value: 3, currency: "USD" });
      })
      .catch(() => {
        // Analytics must not interrupt the listing dashboard.
      });
    return () => controller.abort();
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
  function resume(saved: Progress) {
    const draft = restoreDraft(saved.fields);
    const overLimit = draft.categories.length > additionalCategoryLimit;
    setUploadIssue(null);
    setForm(draft);
    setStep(overLimit ? 0 : saved.step);
    setMsg(overLimit ? additionalCategoryError : "");
  }
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
    setForm(current => {
      if (!current) return current;
      const selected = current[k];
      if (selected.includes(v)) return { ...current, [k]: selected.filter(item => item !== v) };
      if (k === "categories" && (v === current.category || selected.length >= additionalCategoryLimit)) return current;
      return { ...current, [k]: [...selected, v] };
    });
  }
  function upload(files: File[], k: "logo" | "gallery") {
    run(async () => {
      setUploadIssue(null);
      try {
        const remaining = galleryLimit - form.gallery.length;
        if (k === "gallery" && files.length > remaining)
          throw Error(`Choose up to ${remaining} more photos for this gallery.`);
        if (files.some(file => !file.size || file.size > sourceImageLimit))
          throw Error("Choose JPG, PNG, or WebP files of 10 MB or less each.");
        for (const file of files) {
          const {display, preview} = await prepareDirectoryImage(file, k);
          const data = new FormData();
          data.set("file", display, "display");
          if (preview) data.set("thumbnail", preview, "thumbnail.jpg");
          const {url} = await api("upload", data);
          setForm(current => current && (k === "logo"
            ? {...current, logo: url}
            : {...current, gallery: [...current.gallery, url]}));
        }
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
    try {
      sessionStorage.setItem("atg-directory-checkout", id);
    } catch {
      // Checkout works even when browser storage is unavailable.
    }
    window.location.assign(url);
  }

  const descriptionCount = descriptionLength(form?.summary || "");
  const descriptionOver = descriptionCount > descriptionLimit;
  const descriptionBlocked = descriptionOver && (step === 0 || step === 4);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const newsletter = new FormData(e.currentTarget as HTMLFormElement).get("newsletter") === "yes";
    await run(async()=>{
      if (form.categories.length > additionalCategoryLimit) {
        setStep(0);
        throw Error(additionalCategoryError);
      }
      if ((step === 0 || step === 4) && form.name.length > 100) {
        setStep(0);
        throw Error("Shorten your business name to 100 characters or fewer.");
      }
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
      const result = await api("owner", {...form, newsletter});
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
        register={password=>api("login",{email,account,password})}/>
    );
  if(!loaded)return <>{status}<p>Loading your listings…</p><button onClick={()=>location.reload()}>Reload</button></>;
  return (
    <>
      {!form && !checkout && status}
      <h1>{checkout ? "Listing checkout" : form ? "Build your listing" : "My account"}</h1>
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
          {canOpenQueue && <ApprovalNotifications key={session.user.id} session={session} refreshKey={refreshKey} />}
          <section aria-labelledby="my-submissions">
            <h2 id="my-submissions">My submissions</h2>
            <section className="owner-submissions-section" aria-labelledby="directory-submissions">
              <div className="owner-section-heading">
                <h3 id="directory-submissions">Directory listings</h3>
                <div className="owner-section-controls">
                  <button className="primary-action" onClick={() => edit()}>Add a listing</button>
                  <button disabled={busy} onClick={() => run(refresh)}>Refresh status</button>
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
            <MySubmissions key={session.user.id} session={session} refreshKey={refreshKey} />
          </section>
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
                {step===0&&<>
                <fieldset className="listing-type">
                  <legend>Who is this listing for?</legend>
                  <div className="listing-type-options">
                    {listingTypes.map(({ value, label, description }) => (
                      <label key={value} className="listing-type-choice">
                        <input type="radio" name="providerType" value={value} required
                          aria-labelledby={`provider-${value}-label`} aria-describedby={`provider-${value}-help`}
                          checked={form.providerType === value} onChange={() => change("providerType", value)} />
                        <span>
                          <strong id={`provider-${value}-label`}>{label}</strong>
                          <span className="listing-type-help" id={`provider-${value}-help`}>{description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label>Public listing name (100 characters max)
                  <input required maxLength={100} value={form.name} onChange={e => change("name", e.target.value)} />
                  <small>{form.name.length} / 100 characters</small>
                </label>
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
                    onChange={e => {
                      const category = e.target.value;
                      setForm(current => current && { ...current, category, categories: additionalCategories(category, current.categories) });
                    }}
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
                <details className="additional-categories">
                  <summary>Additional categories <span>({form.categories.length} of {additionalCategoryLimit})</span></summary>
                  <p className="quiet" role="status">
                    {form.categories.length > additionalCategoryLimit ? additionalCategoryError :
                      form.categories.length === additionalCategoryLimit ? "Deselect a category to choose another." :
                        "Optional. Choose up to three in addition to your primary category."}
                  </p>
                  {Object.entries(categories).map(([group, items]) => (
                    <fieldset key={group}>
                      <legend>{group}</legend>
                      {items
                        .filter((v) => v !== form.category)
                        .map((v) => (
                          <label key={v}>
                            <input
                              type="checkbox"
                              disabled={!form.categories.includes(v) && form.categories.length >= additionalCategoryLimit}
                              checked={form.categories.includes(v)}
                              onChange={() => toggle("categories", v)}
                            />
                            {v}
                          </label>
                        ))}
                    </fieldset>
                  ))}
                </details>
                <details open={!form.firstName||!form.lastName||!form.phone}><summary>Private listing contact</summary>
                {field("firstName", "First name", true)}
                {field("lastName", "Last name", true)}
                {field("phone", "Phone number", true, "tel")}
                <p>Email · {session.user.email}</p>
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
                {field("url", "Website", false, "url")}
                {field("booking", "Booking or ordering link", false, "url")}
                <details><summary>Social profiles (optional)</summary>
                  {networks.map(({key,label})=><div key={key}>{field(key,label+" URL",false,"url")}</div>)}
                  {field("social","Other social profile",false,"url")}
                </details>
                </>}{step===3&&<><p>Choose JPG, PNG, or WebP images up to 10 MB each. Your device resizes them before upload. Logo and photos are optional.</p>
                {(["logo", "gallery"] as const).map((k) => (
                  <section key={k} className="upload-panel">
                    <label>
                      {k === "logo"
                        ? "Logo or profile photo"
                        : `Photos of your work (${form.gallery.length} of ${galleryLimit})`}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple={k === "gallery"}
                        disabled={k === "gallery" && form.gallery.length >= galleryLimit}
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          if (files.length) upload(files, k);
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
                          src={k === "gallery" ? directoryThumbnail(src) : src}
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
            {step===4 && !form.status && <label><input type="checkbox" name="newsletter" value="yes"/> Email me the All Things Gwinnett newsletter.</label>}
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
      <h4 className="text-lg font-bold leading-tight">{href ? <a href={href}>{name}</a> : name}</h4>
      {status && <p>{status}</p>}
    </div>
  </header>;
}
