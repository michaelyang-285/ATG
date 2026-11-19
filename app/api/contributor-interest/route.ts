import {createHash} from "node:crypto";
import {Failure, human, respond} from "@/lib/directory/server";

export function POST(request: Request) {
  return respond(async () => {
    await human();
    const body = await request.json();
    function field(key: string, max: number) {
      const value = body?.[key];
      if (typeof value !== "string" || !value.trim() || value.length > max)
        throw new Failure(400, "Please check the form fields and try again.");
      return value.trim();
    }
    const name = field("name", 100), email = field("email", 254), idea = field("idea", 2500), intent = field("intent", 40);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !["Pitch a story","Get a topic from Michael"].includes(intent))
      throw new Failure(400, "Check your email address and topic choice.");
    const key = process.env.SUBMISSION_ALERT_RESEND_KEY;
    if (!key) throw new Error("Mail unavailable");
    const message = {from:"All Things Gwinnett <notifications@allthingsgwinnett.com>", to:["michaelyang@285marketing.com"], reply_to:email, subject:"ATG contributor interest: " + intent, text:[name,email,intent,idea].join("\n\n")};
    const id = createHash("sha256").update(JSON.stringify(message)).digest("hex");
    const result = await fetch("https://api.resend.com/emails", {method:"POST", headers:{Authorization:"Bearer " + key,"Content-Type":"application/json","Idempotency-Key":"atg-contributor/" + id}, body:JSON.stringify(message), signal:AbortSignal.timeout(10000)});
    if (!result.ok) throw new Error("Mail delivery unavailable");
    return {ok:true};
  });
}
