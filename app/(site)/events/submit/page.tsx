import EventSubmission from "@/components/EventSubmission";
import { BotIdClient } from "botid/client";
import "@/components/community.css";
export const metadata = {
  title: "Submit a Gwinnett event",
  robots: { index: false },
};
export default function Page() {
  return (
    <main id="main" className="site-width page-content directory-owner">
      <BotIdClient
        protect={[
          { path: "/api/events", method: "POST" },
          { path: "/api/directory/login", method: "POST" },
        ]}
      />
      <EventSubmission />
    </main>
  );
}
