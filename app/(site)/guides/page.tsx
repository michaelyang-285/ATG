import BrowsePage, { TITLES, type Filters } from "@/components/BrowsePage";
export const revalidate = 60;
export const metadata = { title: TITLES["guides"] };
export default function Page({ searchParams }: { searchParams: Filters }) {
  return <BrowsePage kind="guides" filters={searchParams} />;
}
