import type { ReactNode } from "react";

export const metadata = {
  title: "My profile",
  robots: { index: false, follow: false },
};
export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
