"use client";

import { useEffect } from "react";

function setTarget(link: HTMLAnchorElement) {
  if (!["http:", "https:"].includes(link.protocol)) return;
  const host = link.hostname.toLowerCase();
  if (host === location.hostname || host === "allthingsgwinnett.com" || host === "www.allthingsgwinnett.com") {
    if (link.target === "_blank") link.removeAttribute("target");
    return;
  }
  link.target = "_blank";
  link.relList.add("noopener");
}

function updateLinks(node: Element) {
  if (node instanceof HTMLAnchorElement && node.hasAttribute("href")) setTarget(node);
  node.querySelectorAll<HTMLAnchorElement>("a[href]").forEach(setTarget);
}

export default function ExternalLinkTargets() {
  useEffect(() => {
    updateLinks(document.body);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === "attributes" && record.target instanceof HTMLAnchorElement) {
          setTarget(record.target);
        } else {
          record.addedNodes.forEach(node => {
            if (node instanceof Element) updateLinks(node);
          });
        }
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["href"] });
    return () => observer.disconnect();
  }, []);
  return null;
}
