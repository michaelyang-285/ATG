import CalendarHighlights from "@/components/CalendarHighlights";
import BrowsePage, { TITLES, type Filters } from "@/components/BrowsePage";
export const revalidate = 60;
export const metadata = { title: TITLES["local-life"] };
export default function Page({ searchParams }: { searchParams: Filters }) {
  return <><BrowsePage kind="local-life" filters={searchParams} /><CalendarHighlights /></>;
}
