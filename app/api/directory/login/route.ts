import { db, human, respond, Failure } from "@/lib/directory/server";
export function POST(req: Request) {
  return respond(async () => {
    await human();
    const { email, account } = await req.json();
    if(account){
      for(const k of ["firstName","lastName","phone","name"]) if(typeof account[k]!=="string"||!account[k].trim()||account[k].length>240)throw new Failure(400,"Complete all account fields.");
      if(account.phone.replace(/\D/g,"").length<7)throw new Failure(400,"Enter a valid phone number.");
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
        shouldCreateUser:Boolean(account),
        ...(account?{data:{firstName:account.firstName.trim(),lastName:account.lastName.trim(),name:account.name.trim(),phone:account.phone.trim()}}:{}),
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
