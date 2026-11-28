"use client";
import {useState,type FormEvent} from "react";
import {inquiryFields,type InquiryKind} from "@/lib/inquiry-fields";
import "./inquiry-form.css";
export default function InquiryForm({kind}:{kind:InquiryKind}) {
  const [state,setState]=useState<"idle"|"sending"|"sent"|"error">("idle");
  const [notice,setNotice]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(state==="sending") return;
    const values=Object.fromEntries(new FormData(event.currentTarget));
    setState("sending");setNotice("");
    try {
      const result=await fetch("/api/inquiry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...values,kind})});
      if(!result.ok) throw new Error("Unable to send");
      setNotice("Thanks for reaching out. We sent a confirmation to "+values.email+".");
      setState("sent");
    } catch {
      setNotice("Your submission could not be confirmed. Check your details and try again.");
      setState("error");
    }
  }
  return <div className="atg-inquiry"><p role="status">{notice}</p>{state!=="sent" && <form onSubmit={submit}>
    {inquiryFields(kind).map(field=><label key={field.key}>{field.label}{!field.required && " (optional)"}
      {field.type==="textarea"?<textarea name={field.key} rows={5} maxLength={field.max} required={field.required}/>:
        <input name={field.key} type={field.type||"text"} autoComplete={field.autoComplete} maxLength={field.max} required={field.required}/>}
    </label>)}
    <button className="button button-orange" disabled={state==="sending"}>{state==="sending"?"Sending…":kind==="partnership"?"Send partnership inquiry":"Send message"}</button>
  </form>}</div>;
}
