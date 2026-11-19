import "./things-to-do.css";
import BrowsePage, { type Filters } from "@/components/BrowsePage";
export const revalidate = 60;
export const metadata = {
  title: "Things to Do in Gwinnett County",
  description: "Find upcoming Gwinnett events, local guides, parks, museums and live shows, plus recommendations from the All Things Gwinnett community.",
  alternates: { canonical: "/things-to-do" },
};
export default function Page({ searchParams }: { searchParams: Filters }) {
  return <BrowsePage kind="things-to-do" filters={searchParams} />;
}
