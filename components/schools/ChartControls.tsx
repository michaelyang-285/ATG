"use client";
import { useEffect, useRef } from "react";

export default function FeatureCharts() {
  const anchor = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const host = anchor.current;
    if (!host || host.dataset.initialized) return;
    host.dataset.initialized = "true";
    const charts = document.createElement("script");
    charts.src = "/features/gcps-charts.js";
    host.appendChild(charts);
    const map = document.createElement("script");
    map.src = "/features/gcps-household-map.js";
    host.appendChild(map);
  }, []);
  return <span hidden ref={anchor} />;
}
