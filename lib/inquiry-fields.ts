export type InquiryKind = "partnership" | "contact";
export type InquiryField = {key:string;label:string;max:number;required?:boolean;type?:"email"|"textarea";autoComplete?:string};
export function inquiryFields(kind:InquiryKind):InquiryField[] {
  const fields:InquiryField[] = [
    {key:"name",label:"Your name",max:100,required:true,autoComplete:"name"},
    {key:"email",label:"Email address",max:254,required:true,type:"email",autoComplete:"email"}
  ];
  if(kind==="partnership") fields.push(
    {key:"business",label:"Business or organization",max:160,required:true,autoComplete:"organization"},
    {key:"cities",label:"Gwinnett cities you want to reach",max:250},
    {key:"timing",label:"Campaign timing",max:160},
    {key:"budget",label:"Estimated budget",max:100});
  fields.push({key:"message",label:kind==="partnership"?"What would you like to accomplish?":"Your message",type:"textarea",max:3000,required:true});
  return fields;
}
