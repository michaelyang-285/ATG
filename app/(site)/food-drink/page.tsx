import BrowsePage, { type Filters } from "@/components/BrowsePage";
export const revalidate = 60;
export const metadata = {
  title: "Food & Drink in Gwinnett County",
  description: "Find Gwinnett restaurants, markets, and neighborhood food guides from All Things Gwinnett.",
  alternates: { canonical: "/food-drink" },
};
export default function Page({ searchParams }: { searchParams: Filters }) {
  return <BrowsePage kind="food-drink" filters={searchParams} />;
}
