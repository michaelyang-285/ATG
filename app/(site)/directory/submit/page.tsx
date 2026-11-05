import InfoPage, { info } from "@/components/InfoPage";
export const metadata = { title: info["directory-submit"].title };
export default function Page() {
  return <InfoPage kind="directory-submit" />;
}
