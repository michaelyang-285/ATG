import {cache} from "react";
import {notFound} from "next/navigation";
import Link from "next/link";
import {publication,PUBLISHED,imageUrl,safeUrl,formatDate} from "@/lib/publication";
export const revalidate=60;
const load=cache((slug:string)=>publication.fetch('*[_type=="author" && slug.current==$slug][0]{name,bio,role,location,image,socials,"stories":*['+PUBLISHED+' && author._ref==^._id]|order(publishedAt desc){title,"slug":slug.current,publishedAt}}',{slug},{next:{revalidate:60}}));
export async function generateMetadata({params}:{params:{slug:string}}){const a=await load(params.slug);return a?{title:a.name+" | Contributors",description:a.bio?.slice(0,160),alternates:{canonical:"/authors/"+encodeURIComponent(params.slug)}}:{}}
export default async function Page({params}:{params:{slug:string}}){
  const a=await load(params.slug);if(!a)notFound();const photo=imageUrl(a.image,320,320);
  return <main id="main" className="site-width page-content"><article className="prose">
    {photo&&<img src={photo} width="150" height="150" alt=""/>}<h1>{a.name}</h1><p className="story-label">{[a.role,a.location].filter(Boolean).join(" · ")}</p><p>{a.bio}</p>
    {a.socials?.map((s,i)=>safeUrl(s.url)&&<p key={i}><a href={safeUrl(s.url)!}>{s.platform||"Website"} ↗</a></p>)}
    {a.stories.length>0&&<><h2>Stories by {a.name}</h2>{a.stories.map(s=><p key={s.slug}><Link href={"/stories/"+encodeURIComponent(s.slug)}>{s.title}</Link><br/>{formatDate(s.publishedAt)}</p>)}</>}</article></main>;
}
