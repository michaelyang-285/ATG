import { getImageProps } from "next/image";

export function directoryThumbnail(src: string) {
  const host = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!host || !src.startsWith(host + "/storage/v1/object/public/directory-media/")) return src;
  if (/\.gallery\.(png|jpg|webp)$/.test(src))
    return src.replace(/\.gallery\.(png|jpg|webp)$/, ".thumb.jpg");
  // Previously uploaded gallery photos have a single stored file.
  return getImageProps({src, alt: "", width: 144, height: 108}).props.src;
}
