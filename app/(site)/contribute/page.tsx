import InfoPage, { info } from "@/components/InfoPage";
export const metadata = { title: info["contribute"].title };
export default function Page() {
  return <InfoPage kind="contribute" />;
}
