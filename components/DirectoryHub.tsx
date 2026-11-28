import Link from "next/link";
import type {Business} from "@/lib/publication";
import {branchName,publicAddress} from "@/lib/directory/branch";
import {food,grocery,groupFor,groupsFor,groupUrl,landings} from "@/lib/directory/browse-groups";
import type {Filters} from "./BrowsePage";
import {directoryCard} from "@/lib/directory/share";
import AtgVerified from "./AtgVerified";
import IndependentProBadge from "./IndependentProBadge";
import DirectoryMetrics from "./DirectoryMetrics";

function city(b:Business) {return publicAddress(b.address)?.city || b.neighborhood || "Across Gwinnett";}
function serviceCities(b:Business) {return city(b).split(",").map(x=>x.trim()).filter(Boolean);}
function Listing({b,placement}:{b:Business;placement:string}) {
  return <article className="dh-row" data-listing={b._id} data-placement={placement} data-category={b.category}>
    {b.logo && <img src={b.logo} width="50" height="50" alt=""/>}
    <div><h3><Link data-profile href={"/directory/"+encodeURIComponent(b.slug)}>{branchName(b)}</Link></h3>
    {placement==="homepage_feature" ? <Link className="dh-kind" href={"/directory?category="+encodeURIComponent(b.category||"Community")}>{b.category||"Community"}</Link> :
      <span className="dh-kind">{b.category==="Food"?directoryCard(b).label:b.category}</span>}
    <p className="dh-location">{publicAddress(b.address)?.street ? b.address : city(b)}</p>
    {b.summary && <p className="dh-summary">{b.summary}</p>}
    {b.premium && <AtgVerified/>} {b.providerType==="independent" && <IndependentProBadge/>}</div></article>;
}
export default function DirectoryHub({businesses,filters,unsupported}:{businesses:Business[];filters:Filters;unsupported:string}) {
  const group = filters.group || "";
  const landing = Object.values(landings).find(item=>item.name===group);
  const path = landing ? groupUrl(group) : "/directory";
  const browsing = Boolean(group || filters.all || filters.q || filters.category || filters.provider || filters.service || filters.city);
  const rows = businesses.filter(b=>!group || groupsFor(b).has(group));
  const cities = Array.from(new Set(rows.flatMap(serviceCities))).sort();
  const filtered = rows.filter(b=>!filters.city || serviceCities(b).includes(filters.city));
  const counts = new Map<string,number>();
  for(const b of businesses) for(const name of Array.from(groupsFor(b))) counts.set(name,(counts.get(name)||0)+1);
  const groups = Array.from(counts).sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0]));
  const paid = businesses.filter(b=>b.premium).sort((a,b)=>a._id.localeCompare(b._id));
  const offset = paid.length ? Math.floor(Date.now()/3600000)%paid.length : 0;
  const featured = [...paid.slice(offset),...paid.slice(0,offset)].slice(0,2);
  const scope = group || filters.category || (filters.provider==="independent"?"Independent pros":filters.service);
  const clearParams = new URLSearchParams();
  for(const key of ["group","category","service","provider","all"] as const) {
    if(filters[key] && !(landing && key==="group")) clearParams.set(key,filters[key]);
  }
  const clearUrl = path + (clearParams.size ? "?"+clearParams : "");
  const title = scope || (filters.q ? "Directory search" : filters.all ? "All listings" : "Gwinnett directory");
  const sections = group===grocery && !filters.city ? cities.map(c=>({label:c,items:filtered.filter(b=>serviceCities(b).includes(c))})) : [{label:"",items:filtered}];
  return <main id="main" className="site-width page-content dh"><DirectoryMetrics view={JSON.stringify([filters,(browsing?filtered:featured).map(b=>b._id)])} group={scope}>
    {browsing && <nav aria-label="Breadcrumb"><Link href="/directory">Directory</Link> / {title}</nav>}
    <header><h1>{title}</h1><p>{landing?.description || (browsing ? "" : "Find businesses, independent pros and community organizations across Gwinnett County.")}</p></header>
    <form action={path} role="search" className="dh-form">
      {!landing && group && <input type="hidden" name="group" value={group}/>}
      {(["category","provider","service"] as const).map(k=>filters[k] && <input key={k} type="hidden" name={k} value={filters[k]}/>)}
      <label>Search {scope?"these listings":"the directory"}<input type="search" name="q" defaultValue={filters.q} placeholder="Business, service or city" maxLength={100}/></label>
      {landing && <label>City<select name="city" defaultValue={filters.city||""}><option value="">All cities</option>{Array.from(new Set([...cities,...(filters.city?[filters.city]:[])])).sort().map(c=><option key={c}>{c}</option>)}</select></label>}
      <button className="button button-orange">Search</button>
    </form>
    {!browsing ? <>
      {featured.length>0 && <section className="dh-feature"><div className="dh-section-heading"><h2>Featured local businesses</h2><small>Sponsored</small></div><div className="dh-pair">{featured.map(b=><Listing key={b._id} b={b} placement="homepage_feature"/>)}</div></section>}
      <section><div className="dh-section-heading"><h2>Browse by category</h2><Link href="/directory?all=1">Browse all {businesses.length} listings</Link></div>
        <div className="dh-index">{groups.map(([name,count])=><Link key={name} href={groupUrl(name)}><strong>{name}</strong><span>{count} {count===1?"listing":"listings"}</span></Link>)}</div></section>
    </> : <section><div className="dh-section-heading"><h2>{filtered.length} {filtered.length===1?"listing":"listings"}</h2>{(filters.q || filters.city) && <Link href={clearUrl}>Clear search</Link>}</div>
      {unsupported && <p>We couldn’t match {unsupported} to a Gwinnett city or ZIP.</p>}
      {!filtered.length && <p>Try another business name or <Link href="/directory">browse all categories</Link>.</p>}
      {sections.map(s=><div key={s.label}>{s.label && <h2 className="dh-city">{s.label}</h2>}{s.items.map(b=><Listing key={b._id} b={b} placement={filters.q?"search_results":scope?"category_results":"all_listings"}/>)}</div>)}</section>}
    <aside className="directory-owner-tools"><h2>List your business</h2><p>Start free, or get featured rotation on the directory homepage and priority in relevant categories for $12 a year.</p><div><Link href="/directory/submit">Free and paid listings</Link><Link href="/deals">Gwinnett Deals</Link><Link href="/account?mode=signin">Manage my listings</Link></div></aside>
  </DirectoryMetrics></main>;
}
