import BrowsePage, { type Filters } from "@/components/BrowsePage";
export const revalidate = 60;
export const metadata = {
  title: "Local Life in Gwinnett County",
  description: "Read about Gwinnett schools, population, and neighborhoods, and find community events and resources.",
  alternates: { canonical: "/local-life" },
};
export default function Page({ searchParams }: { searchParams: Filters }) {
  return <BrowsePage kind="local-life" filters={searchParams} />;
}
