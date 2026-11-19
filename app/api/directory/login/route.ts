import { deletionReviewEmail } from "@/lib/directory/deletion-review";
import { db, human, respond, Failure } from "@/lib/directory/server";
import { eligibleLocation, areaError } from "@/lib/directory/business-location";
export function POST(req: Request) {
  return respond(async () => {
    await human();
    const { email, account, eventSignup } = await req.json();
    if (account) {
      for (const k of eventSignup === true
        ? ["firstName", "lastName"]
        : ["firstName", "lastName", "phone", "name"])
        if (
          typeof account[k] !== "string" ||
          !account[k].trim() ||
          account[k].length > 240
        )
          throw new Failure(400, "Complete all account fields.");
      if (eventSignup !== true && !eligibleLocation(account.city, account.zip)) throw new Failure(400, areaError);
      if (eventSignup !== true && account.phone.replace(/\D/g, "").length < 7)
        throw new Failure(400, "Enter a valid phone number.");
    }
    if (
      typeof email !== "string" ||
      email.length > 254 ||
      !/^\S+@\S+\.\S+$/.test(email)
    )
      throw new Failure(400, "Enter a valid email.");
    const { error } = await db().auth.signInWithOtp({
      email,
      options: {
        // The designated reviewer can enter the dashboard with a verified email link.
        shouldCreateUser: Boolean(account) || email.trim().toLowerCase() === deletionReviewEmail,
        ...(account
          ? {
              data: {
                firstName: account.firstName.trim(),
                lastName: account.lastName.trim(),
                ...(eventSignup === true
                  ? {}
                  : { name: account.name.trim(), phone: account.phone.trim(), city: account.city.trim(), zip: account.zip.trim() }),
              },
            }
          : {}),
        emailRedirectTo: new URL(
          eventSignup === true ? "/events/submit" : "/directory/manage",
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
