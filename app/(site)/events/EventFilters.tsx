"use client";
import { cities as gwinnettCities } from "@/lib/gwinnett";
import { localClock } from "@/lib/event-time";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useTransition} from "react";

export default function EventFilters({cities,city,date,audience,query}:{query:string;cities:string[];city:string;date:string;audience:string}){
  const router=useRouter(),[pending,start]=useTransition();
  const cityOptions = Array.from(new Set([...gwinnettCities, ...cities])).sort();
  return <form action="/events" onChange={e=>{
    if(e.target instanceof HTMLInputElement && e.target.name==="q") return;
    if(!e.currentTarget.checkValidity()) return;
    const params=new URLSearchParams();
    new FormData(e.currentTarget).forEach((value,key)=>{if(typeof value==="string"&&value) params.set(key,value)});
    start(()=>router.replace(params.size?"/events?"+params:"/events",{scroll:false}));
  }}>
    <div style={{flexBasis:"100%",display:"flex",alignItems:"end",gap:".5rem"}}>
      <label style={{flex:1,minWidth:0}}>Search events<input type="search" name="q" defaultValue={query} maxLength={120} placeholder="Event, venue, or keyword"/></label>
      <button className="button button-orange" type="submit">Search</button>
    </div>
    <label>City<select name="city" defaultValue={city}><option value="">All cities</option>{cityOptions.map(c=><option key={c}>{c}</option>)}</select></label>
    <label>Choose a date<input type="date" name="date" defaultValue={date}
      style={{cursor:"pointer"}}
      onClick={e => {
        e.currentTarget.min = localClock(Date.now()).slice(0,10);
        try { e.currentTarget.showPicker?.(); }
        catch { /* Embedded browsers may restrict the native picker API. */ }
      }}
      onFocus={e => { e.currentTarget.min = localClock(Date.now()).slice(0,10); }}
      min={localClock(Date.now()).slice(0,10)} max="2100-12-31"/></label>
    <label>Audience<select name="audience" defaultValue={audience}><option value="">All ages</option>{["Kids","Teens","Adults"].map(a=><option key={a}>{a}</option>)}</select></label>
    {(query||city||date||audience)&&<Link href="/events" scroll={false}>Clear filters</Link>}
    <span role="status">{pending?"Updating events…":""}</span>
  </form>;
}
