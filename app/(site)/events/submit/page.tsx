import EventSubmission from "@/components/EventSubmission";
import "@/components/community.css";
export const metadata = {
  title: "Submit a Gwinnett event",
  robots: { index: false },
};
export default function Page() {
  return (
    <main id="main" className="site-width page-content directory-owner">
      <EventSubmission />
    </main>
  );
}
