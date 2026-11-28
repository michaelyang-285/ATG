"use client";
import {useState} from "react";

const fallback = "/brand/atg-avatar.png";

export default function ListingLogo({src, size, loading}: {
  src?: string | null;
  size: number;
  loading?: "lazy" | "eager";
}) {
  const [failedSource, setFailedSource] = useState<string>();
  const source = src?.trim();
  const useFallback = !source || source === failedSource || source === fallback;
  return <img src={useFallback ? fallback : source} width={size} height={size}
    alt="" loading={loading} onError={useFallback ? undefined : () => setFailedSource(source)}
    style={{objectFit:"contain", ...(useFallback ? {filter:"grayscale(1)", opacity:0.5} : {})}} />;
}
