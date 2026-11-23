import {browserClient} from "./browser-client";
export async function portalRequest(path:string,body?:unknown) {
  const session=(await browserClient()?.auth.getSession())?.data.session;
  if(!session) throw Error("Sign in with your ATG account.");
  const response=await fetch(path,{method:body?"POST":"GET",cache:"no-store",headers:{Authorization:"Bearer "+session.access_token,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
  const data=await response.json();
  if(!response.ok) throw Error(data.error || "Request failed.");
  return data;
}
export type Assignment={id:string;title:string;questions:string[];answers:Record<string,string>;revision:number;submitted:boolean};
