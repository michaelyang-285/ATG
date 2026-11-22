import {retryNewsletter} from "@/lib/newsletter";
export const dynamic="force-dynamic";
export const maxDuration=60;
export async function GET(request:Request) {
  if (!process.env.CRON_SECRET || request.headers.get("Authorization")!=="Bearer "+process.env.CRON_SECRET) return new Response(null,{status:401});
  return Response.json(await retryNewsletter());
}