import { createClient } from "@supabase/supabase-js";
import { human, respond, Failure } from "@/lib/directory/server";
export function POST(req: Request) {
  return respond(async () => {
    await human();
    const { email, password, account, tier, eventSignup, generalAccount } = await req.json();
    if (!account || typeof password !== "string" || password.length < 8) throw new Failure(400, "Use a password with at least 8 characters.");
    if (account) {
      if (eventSignup !== true && typeof account.name === "string" && account.name.length > 100)
        throw new Failure(400, "Shorten your business name to 100 characters or fewer.");
      for (const k of eventSignup === true
        ? ["firstName", "lastName", "phone"]
        : ["firstName", "lastName", "phone", "name"])
        if (
          typeof account[k] !== "string" ||
          !account[k].trim() ||
          account[k].length > 240
        )
          throw new Failure(400, "Complete all account fields.");
      if (account.phone.replace(/\D/g, "").length < 7)
        throw new Failure(400, "Enter a valid phone number.");
    }
    if (
      typeof email !== "string" ||
      email.length > 254 ||
      !/^\S+@\S+\.\S+$/.test(email)
    )
      throw new Failure(400, "Enter a valid email.");
    const auth = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {auth:{persistSession:false, autoRefreshToken:false}}).auth;
    const { error } = await auth.signUp({
      password,
      email,
      options: {
        ...(account
          ? {
              data: {
                firstName: account.firstName.trim(),
                lastName: account.lastName.trim(),
                phone: account.phone.trim(),
                ...(eventSignup === true
                  ? {}
                  : { name: account.name.trim() }),
              },
            }
          : {}),
        emailRedirectTo: new URL(
          generalAccount === true ? "/create-account" : eventSignup === true ? "/events/submit" : tier==="paid" || tier==="free" ? "/account?tier="+tier : "/account",
          process.env.DIRECTORY_SITE_URL!,
        ).href,
      },
    });
    if (error)
      throw new Failure(
        429,
        "Couldn’t complete registration. Try another password, or use password recovery if you already have an account.",
      );
    return { ok: true };
  });
}
