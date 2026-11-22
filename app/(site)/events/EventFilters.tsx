"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useTransition} from "react";

export default function EventFilters({cities,city,date,audience}:{cities:string[];city:string;date:string;audience:string}){
  const router=useRouter(),[pending,start]=useTransition();
  return <form action="/events" onChange={e=>{
    if(!e.currentTarget.checkValidity()) return;
    const params=new URLSearchParams();
    new FormData(e.currentTarget).forEach((value,key)=>{if(typeof value==="string"&&value) params.set(key,value)});
    start(()=>router.replace(params.size?"/events?"+params:"/events",{scroll:false}));
  }}>
    <label>City<select name="city" defaultValue={city}><option value="">All cities</option>{cities.map(c=><option key={c}>{c}</option>)}</select></label>
    <label>Choose a date<input type="date" name="date" defaultValue={date} min="1900-01-01" max="2100-12-31"/></label>
    <label>Audience<select name="audience" defaultValue={audience}><option value="">All ages</option>{["Kids","Teens","Adults"].map(a=><option key={a}>{a}</option>)}</select></label>
    <noscript><button>Apply filters</button></noscript>
    {(city||date||audience)&&<Link href="/events" scroll={false}>Clear filters</Link>}
    <span role="status">{pending?"Updating events…":""}</span>
  </form>;
}
