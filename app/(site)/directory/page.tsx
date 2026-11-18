import BrowsePage, { type Filters } from "@/components/BrowsePage";
import "./directory.css";
export const revalidate = 60;
const title = "Gwinnett County Business & Community Directory";
const description = "Find coffee shops, mobile mechanics, beauty professionals and community organizations across Gwinnett County. Browse by category, city or service.";
export function generateMetadata({searchParams}:{searchParams:Filters}) {
  return {title,description,alternates:{canonical:"/directory"},robots:Object.keys(searchParams).length?{index:false,follow:true}:undefined,
    openGraph:{title,description,url:"/directory",images:["/brand/og.png"]}};
}
export default function Page({searchParams}:{searchParams:Filters}) {
  return <div className="atg-directory"><BrowsePage kind="directory" filters={searchParams}/></div>;
}
