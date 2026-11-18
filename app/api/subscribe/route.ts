import { db, human, respond, Failure } from "@/lib/directory/server";

export function POST(request: Request) {
  return respond(async () => {
    await human();
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Failure(400, "Enter a valid email address.");
    }
    const { error } = await db().from("newsletter_subscribers")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
    if (error) throw error;
    return { ok: true };
  });
}
