export const networks = [
  {key:"facebook", label:"Facebook", hosts:["facebook.com","fb.com","fb.me"]},
  {key:"meta", label:"Meta", hosts:["meta.com"]},
  {key:"instagram", label:"Instagram", hosts:["instagram.com"]},
  {key:"tiktok", label:"TikTok", hosts:["tiktok.com"]},
  {key:"linkedin", label:"LinkedIn", hosts:["linkedin.com"]},
  {key:"x", label:"X", hosts:["x.com","twitter.com"]},
  {key:"threads", label:"Threads", hosts:["threads.com","threads.net"]},
  {key:"youtube", label:"YouTube", hosts:["youtube.com","youtu.be"]},
  {key:"pinterest", label:"Pinterest", hosts:["pinterest.com","pin.it"]},
] as const;
export type SocialKey = typeof networks[number]["key"];
export type SocialFields = Partial<Record<SocialKey,string>>;
export const blankSocial = Object.fromEntries(networks.map(n=>[n.key,""])) as Record<SocialKey,string>;
