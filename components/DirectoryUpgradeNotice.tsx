"use client";
import {useState} from "react";
import Link from "next/link";
import group from "@/lib/facebook-group.json";

type Listing = {id:string; draft:{name?:string}; billing:boolean; profilePath?:string|null; deletion_due_at:string|null; premium_until:string|null};
export default function DirectoryUpgradeNotice({listings,busy,onUpgrade}:{listings:Listing[];busy:boolean;onUpgrade:(id:string)=>void}) {
  const [choice,setChoice]=useState("");
  const available=listings.filter(row=>row.profilePath && !row.deletion_due_at && !row.billing && !(Date.parse(row.premium_until || "")>Date.now()));
  if(!available.length) return null;
  const selected=available.find(row=>row.id===choice) || available[0];
  return <aside className="directory-upgrade-note" aria-labelledby="upgrade-notice-title">
    <h3 id="upgrade-notice-title">Have a deal for Gwinnett?</h3>
    <p>For $9 a year, add an offer to the deals page we share weekly with our {group.memberCountDisplay} Facebook group members. It’s also in our welcome post for new members.</p>
    {available.length>1 && <label>Choose a free listing<select value={selected.id} onChange={e=>setChoice(e.target.value)}>{available.map(row=><option key={row.id} value={row.id}>{row.draft.name}</option>)}</select></label>}
    <div><button className="primary-action" disabled={busy} onClick={()=>onUpgrade(selected.id)}>Upgrade {available.length===1 ? selected.draft.name || "my listing" : "selected listing"} · $9/year</button><Link href="/directory/submit">Compare plans</Link></div>
  </aside>;
}
