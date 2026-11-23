import "./account.css";
import OwnerDashboard from "@/components/OwnerDashboard";
export const metadata = {
  title: "My account",
  robots: { index: false },
};
export default function Manage() {
  return (
    <main id="main" className="site-width page-content directory-owner">
      <OwnerDashboard />
    </main>
  );
}
