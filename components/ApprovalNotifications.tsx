"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

export default function ApprovalNotifications({ session, refreshKey }: { session: Session; refreshKey: number }) {
  const [pending, setPending] = useState<number | "loading" | "unavailable">("loading");
  const token = session.access_token;

  useEffect(() => {
    let current: AbortController | undefined;
    async function refresh() {
      if (document.visibilityState === "hidden") return;
      current?.abort();
      const controller = new AbortController();
      current = controller;
      try {
        const response = await fetch("/api/admin/approvals?view=count", {
          headers: { Authorization: "Bearer " + token }, cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) throw Error();
        const data = await response.json();
        if (!Number.isSafeInteger(data.pending) || data.pending < 0) throw Error();
        if (!controller.signal.aborted) setPending(data.pending);
      } catch {
        if (!controller.signal.aborted) setPending("unavailable");
      }
    }
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      current?.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, [token, refreshKey]);

  const label = typeof pending === "number" ? `${pending} pending ${pending === 1 ? "item" : "items"}`
    : pending === "loading" ? "loading count…" : "count unavailable";
  return <section aria-labelledby="approval-notifications" className="account-notifications">
    <h3 id="approval-notifications">Notifications</h3>
    <a className="text-link" href="/admin/approvals">
      Open approval queue <span aria-live="polite" className="account-pending">{label}</span>
    </a>
  </section>;
}
