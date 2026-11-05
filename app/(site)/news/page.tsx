import { permanentRedirect } from "next/navigation";
export default function Page() {
  permanentRedirect("/local-life?format=news");
}
