import { db } from "@/lib/directory/server";
import { eventStore } from "@/lib/community-event-store";

const queueUrl = "https://allthingsgwinnett.com/admin/approvals";
type Alert = { id: string; title: string };
type Kind = "profile" | "event";

async function deliver(kind: Kind, alert: Alert) {
  const key = process.env.SUBMISSION_ALERT_RESEND_KEY;
  if (!key) throw Error("Submission email delivery is unavailable");
  const label = kind === "event" ? "event" : "directory profile";
  const title = alert.title.replace(/[\r\n]+/g, " ").trim();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      "Idempotency-Key": "atg-submission/" + kind + "/" + alert.id,
    },
    body: JSON.stringify({
      from: "All Things Gwinnett <notifications@allthingsgwinnett.com>",
      to: ["michaelyang@285marketing.com"],
      subject: "New " + label + " for review: " + title,
      text: [title, "", "A new " + label + " is ready for your review.", "", "Open the approval queue:", queueUrl].join("\n"),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw Error("Submission email provider returned " + response.status);
  if (kind === "profile") {
    const { error } = await db().from("profile_submission_alerts").delete().eq("listing_id", alert.id);
    if (error) throw error;
  } else {
    await eventStore().delete(alert.id);
  }
}

// Each submission and its pending alert are saved together in the source store.
// A provider outage must not undo a submission that was already accepted.
export async function deliverSubmissionAlerts(kind: Kind, id?: string) {
  const batchSize = 25;
  let pending: Alert[];
  if (kind === "profile") {
    let query = db().from("profile_submission_alerts").select("id:listing_id,title").order("created_at").limit(batchSize);
    if (id) query = query.eq("listing_id", id);
    const { data, error } = await query;
    if (error) throw error;
    pending = data || [];
  } else {
    pending = await eventStore().fetch<Alert[]>(
      '*[_type == "communitySubmissionAlert" && _id in path("drafts.**") && (!defined($id) || _id == $id)] | order(_createdAt asc)[0...$limit]{"id": _id, title}',
      { id: id || null, limit: batchSize }, { cache: "no-store" }
    );
  }
  let failed = 0;
  for (const alert of pending) {
    try { await deliver(kind, alert); }
    catch { failed++; }
  }
  if (failed) throw Error("Some submission alerts could not be delivered");
  return pending.length;
}

export async function notifySubmission(kind: Kind, id: string) {
  try { await deliverSubmissionAlerts(kind, id); }
  catch { console.error("Submission email awaiting retry", { kind, id }); }
}
