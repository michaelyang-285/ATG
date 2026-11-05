import InfoPage, { info } from "@/components/InfoPage";
export const metadata = { title: info["advertise"].title };
export default function Page() {
  return <InfoPage kind="advertise" />;
}
