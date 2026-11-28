import BrowsePage, { TITLES, type Filters } from "@/components/BrowsePage";
export const revalidate = 60;
export const metadata = { title: TITLES["search"], robots:{index:false,follow:true}, alternates:{canonical:"/search"} };
export default function Page({ searchParams }: { searchParams: Filters }) {
  return <BrowsePage kind="search" filters={searchParams} />;
}
