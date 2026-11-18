import { BotIdClient } from "botid/client";
import OwnerDashboard from "@/components/OwnerDashboard";
export const metadata = {
  title: "Manage your directory listings",
  robots: { index: false },
};
export default function Manage() {
  return (
    <main id="main" className="site-width page-content directory-owner">
      <BotIdClient
        protect={["login", "owner", "progress", "upload", "checkout"].map((path) => ({
          path: "/api/directory/" + path,
          method: "POST" as const,
        }))}
      />
      <OwnerDashboard />
    </main>
  );
}
