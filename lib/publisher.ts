import {facebookGroup} from "./gwinnett";
export const siteUrl = "https://allthingsgwinnett.com";
export const publisher = {
  "@type":"NewsMediaOrganization","@id":siteUrl+"/#organization",
  name:"All Things Gwinnett",alternateName:"ATG",url:siteUrl+"/",
  description:"An independent guide to Gwinnett County’s food, culture, businesses and community.",
  logo:{"@type":"ImageObject",url:siteUrl+"/brand/atg-avatar.png"},
  sameAs:["https://www.facebook.com/AllThingsGwinnett","https://www.instagram.com/allthingsgwinnett/","https://www.linkedin.com/company/all-things-gwinnett/",facebookGroup]
};
export const website = {"@type":"WebSite","@id":siteUrl+"/#website",name:publisher.name,
  alternateName:"ATG",url:siteUrl+"/",inLanguage:"en-US",publisher:{"@id":publisher["@id"]}};
