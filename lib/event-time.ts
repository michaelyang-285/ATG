const dayMs=86400000;
export const zone="America/New_York";
const clock=new Intl.DateTimeFormat("sv-SE",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
export function localClock(time:string|number){return clock.format(new Date(time)).replace(" ","T")}
export function validDay(value:string){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value}
export function shift(day:string,n:number){return new Date(Date.parse(day)+n*dayMs).toISOString().slice(0,10)}
export function easternInstant(local:string){
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)||!validDay(local.slice(0,10)))return null;
  for(const offset of ["-04:00","-05:00"]){const t=Date.parse(local+offset);if(Number.isFinite(t)&&localClock(t)===local)return new Date(t).toISOString()}
  return null;
}
