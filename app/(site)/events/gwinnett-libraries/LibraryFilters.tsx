"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = { path:string; branches:string[]; branch:string; audience:string };
export default function LibraryFilters({path,branches,branch,audience}:Props) {
  const router=useRouter();
  const [pending,startTransition]=useTransition();
  return <form action={path} onChange={event=>{
    const query=new URLSearchParams();
    new FormData(event.currentTarget).forEach((value,key)=>{
      if(typeof value==="string" && value) query.set(key,value);
    });
    startTransition(()=>router.replace(query.size ? path+"?"+query : path,{scroll:false}));
  }}>
    <label>Branch<select name="branch" defaultValue={branch}><option value="">All branches</option>{branches.map(b=><option key={b}>{b}</option>)}</select></label>
    <label>Audience<select name="audience" defaultValue={audience}><option value="">All ages</option>{["Kids","Teens","Adults"].map(a=><option key={a}>{a}</option>)}</select></label>
    <noscript><button type="submit">Apply filters</button></noscript>
    {(branch||audience)&&<Link href={path} scroll={false}>Clear filters</Link>}
    <span role="status" className={pending?undefined:"sr-only"}>{pending?"Updating listings…":""}</span>
  </form>;
}
