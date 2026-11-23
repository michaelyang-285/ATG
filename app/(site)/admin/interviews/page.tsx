"use client";
import { useEffect, useRef, useState } from "react";
import { browserClient } from "@/lib/browser-client";

const endpoint="/api/admin/interviews";
export default function InterviewStudio(){
 const [html,setHtml]=useState(""),[message,setMessage]=useState("Checking admin access…"),[settings,setSettings]=useState(false);
 const [keySet,setKeySet]=useState(false),requestRef=useRef<(body:unknown)=>Promise<unknown>>(),field=useRef<HTMLInputElement>(null);
 useEffect(()=>{
  const client=browserClient();if(!client){setMessage("Account sign-in is unavailable.");return;}
  let alive=true;
  async function request(body?:unknown){
   const session=(await client.auth.getSession()).data.session;
   if(!session)throw Error("Sign in to your ATG admin account to open the studio.");
   const res=await fetch(endpoint,{method:body?"POST":"GET",cache:"no-store",headers:{Authorization:"Bearer "+session.access_token,"Content-Type":"application/json",},body:body?JSON.stringify(body):undefined});
   const data=await res.json();if(!res.ok)throw Error(data.error||"Studio request failed.");return data;
  }
  const studioWindow=window as Window & {interviewRequest?:typeof request;interviewUpload?:(file:string,token:string,blob:Blob)=>Promise<void>};
  requestRef.current=request;
  studioWindow.interviewRequest=request;
  studioWindow.interviewUpload=async(file,token,blob)=>{
   const {error}=await client.storage.from("admin-interview-media").uploadToSignedUrl(file,token,blob,{contentType:blob.type});if(error)throw Error("Upload failed. Try again.");
  };
  request().then(data=>{if(alive){setHtml(data.html);setKeySet(data.configured);}}).catch(e=>{if(alive)setMessage(e.message)});
  const {data}=client.auth.onAuthStateChange(event=>{if(event==="SIGNED_OUT"){setHtml("");setMessage("Sign in to your ATG admin account.");}});
  return ()=>{alive=false;delete studioWindow.interviewRequest;delete studioWindow.interviewUpload;data.subscription.unsubscribe();};
 },[]);
 return <main id="main" className="site-width page-content">
 <a href="/account">← My account</a>
 {!html?<><h1>Interview studio</h1><p role="status">{message}</p><a href="/account?mode=signin">Open account sign-in</a></>:<>
 <div style={{marginBlock:"1rem"}}><button onClick={()=>setSettings(!settings)}>{keySet?"AI settings":"Connect OpenAI"}</button>
 {settings&&<form onSubmit={async e=>{e.preventDefault();const value=field.current?.value.trim();if(value?.startsWith("sk-")){try{await requestRef.current({action:"saveCredential",key:value});field.current.value="";setKeySet(true);setSettings(false);setMessage("Connected across your admin devices.");}catch(err){setMessage((err as Error).message);}}}}><label>Save studio API key to your admin account<input ref={field} type="password" autoComplete="off" required pattern="sk-.+" /></label><button>Connect</button></form>}<small role="status">{message==="Checking admin access…"?"":message}</small></div>
 <iframe title="Private interview studio" allow="microphone 'self'" srcDoc={html} style={{width:"100%",height:"85dvh",minHeight:550,border:0}}/></>}
 </main>;
}
