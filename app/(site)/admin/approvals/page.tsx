import ApprovalQueue from "@/components/ApprovalQueue";

export const metadata = { title: "Approval queue", robots: { index: false, follow: false } };

export default function Approvals() {
  return <main id="main" className="site-width page-content directory-owner">
    <h1>Approval queue</h1>
    <ApprovalQueue />
  </main>;
}
