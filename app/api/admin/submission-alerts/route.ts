import { deliverSubmissionAlerts } from "@/lib/submission-alerts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== "Bearer " + secret)
    return new Response(null, { status: 401 });
  const results = await Promise.allSettled([
    deliverSubmissionAlerts("profile"), deliverSubmissionAlerts("event"),
  ]);
  return Response.json({ ok: results.every(result => result.status === "fulfilled") }, {
    status: results.some(result => result.status === "rejected") ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
