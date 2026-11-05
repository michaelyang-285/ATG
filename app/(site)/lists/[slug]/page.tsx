import { permanentRedirect } from "next/navigation";
export default function Page({ params }: { params: { slug: string } }) {
  permanentRedirect("/stories/" + encodeURIComponent(params.slug));
}
