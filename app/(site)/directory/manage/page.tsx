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
        protect={["login", "owner", "upload", "checkout"].map((path) => ({
          path: "/api/directory/" + path,
          method: "POST" as const,
        }))}
      />
      <h1>Manage your listings</h1>
      <OwnerDashboard />
    </main>
  );
}
