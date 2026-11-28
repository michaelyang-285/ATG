import {categoryInventory} from "@/lib/directory/category-inventory";
import {notFound} from "next/navigation";
import BrowsePage,{type Filters} from "@/components/BrowsePage";
import {landings} from "@/lib/directory/browse-groups";
import "../../directory.css";

type Props = {params:{group:string};searchParams:Filters};
function landing(slug:string) {
  if (!Object.prototype.hasOwnProperty.call(landings,slug)) notFound();
  return landings[slug];
}
export async function generateMetadata({params,searchParams}:Props) {
  const {name,description}=landing(params.group);
  const title=name+" in Gwinnett County";
  const url="/directory/category/"+params.group;
  const image = {url:url+"/share-image",width:1200,height:630,alt:name+" in Gwinnett County | All Things Gwinnett"};
  return {title,description,twitter:{card:"summary_large_image",title,description,images:[image.url]},alternates:{canonical:url},robots:(Object.keys(searchParams).length || !(await categoryInventory()).slugs.includes(params.group))?{index:false,follow:true}:undefined,
    openGraph:{type:"website",siteName:"All Things Gwinnett",title,description,url,images:[image]}};
}
export default function Page({params,searchParams}:Props) {
  const {name}=landing(params.group);
  const base="https://allthingsgwinnett.com";
  const crumbs=["Home","Directory",name].map((label,i)=>({"@type":"ListItem",position:i+1,name:label,item:base+["/","/directory","/directory/category/"+params.group][i]}));
  return <div className="atg-directory"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:crumbs})}}/><BrowsePage kind="directory" filters={{...searchParams,group:name}}/></div>;
}
