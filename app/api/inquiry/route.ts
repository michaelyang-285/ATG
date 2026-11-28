import {createHash} from "node:crypto";
import {Failure,human,respond} from "@/lib/directory/server";
import {inquiryFields} from "@/lib/inquiry-fields";

export function POST(request:Request) {
  return respond(async()=>{
    await human();
    const body=await request.json().catch(()=>null);
    const kind=body?.kind;
    if(kind!=="partnership" && kind!=="contact") throw new Failure(400,"Choose a valid inquiry type.");
    const fields=inquiryFields(kind);
    const values:Record<string,string>={};
    for(const field of fields) {
      const raw=body[field.key]??"";
      if(typeof raw!=="string" || raw.length>field.max || (field.required && !raw.trim()))
        throw new Failure(400,"Check "+field.label.toLowerCase()+".");
      values[field.key]=raw.trim();
    }
    if(!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(values.email)) throw new Failure(400,"Check your email address.");
    const key=process.env.SUBMISSION_ALERT_RESEND_KEY;
    if(!key) throw new Error("Email unavailable");
    const owner="michaelyang@285marketing.com";
    const from="All Things Gwinnett <notifications@allthingsgwinnett.com>";
    const topic=kind==="partnership"?"partnership inquiry":"contact message";
    const messages=[
      {from,to:[owner],reply_to:values.email,subject:"ATG "+topic,text:fields.map(field=>field.label+"\n"+(values[field.key]||"(left blank)")).join("\n\n")},
      {from,to:[values.email],reply_to:owner,subject:"All Things Gwinnett received your "+topic,
        text:"Thanks for contacting All Things Gwinnett. We received your "+topic+" and will review it. You can reply to this email to add details.\n\nAll Things Gwinnett"}
    ];
    const hash=createHash("sha256").update(JSON.stringify(messages)).digest("hex");
    const result=await fetch("https://api.resend.com/emails/batch",{method:"POST",headers:{
      Authorization:"Bearer "+key,"Content-Type":"application/json","Idempotency-Key":"atg-inquiry/"+hash
    },body:JSON.stringify(messages),signal:AbortSignal.timeout(12000)});
    if(!result.ok) throw new Error("Email delivery unavailable");
    return {ok:true};
  });
}
