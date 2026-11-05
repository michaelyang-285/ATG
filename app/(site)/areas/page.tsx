import BrowsePage, { TITLES, type Filters } from "@/components/BrowsePage";
export const revalidate = 60;
export const metadata = { title: TITLES["areas"] };
export default function Page({ searchParams }: { searchParams: Filters }) {
  return <BrowsePage kind="areas" filters={searchParams} />;
}
