import InfoPage, { info } from "@/components/InfoPage";
export const metadata = { title: info["editorial-standards"].title };
export default function Page() {
  return <InfoPage kind="editorial-standards" />;
}
