import { db, human, respond, Failure } from "@/lib/directory/server";
export function POST(req: Request) {
  return respond(async () => {
    await human();
    const { email } = await req.json();
    if (
      typeof email !== "string" ||
      email.length > 254 ||
      !/^\S+@\S+\.\S+$/.test(email)
    )
      throw new Failure(400, "Enter a valid email.");
    const { error } = await db().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: new URL(
          "/directory/manage",
          process.env.DIRECTORY_SITE_URL!,
        ).href,
      },
    });
    if (error)
      throw new Failure(
        429,
        "Unable to send the link. Wait a moment and try again.",
      );
    return { ok: true };
  });
}
