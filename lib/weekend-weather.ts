import { localClock } from "./event-time";

const locations: Record<string,string> = {
  Auburn:"34.0137,-83.8277", "Berkeley Lake":"33.9837,-84.1866", Braselton:"34.1093,-83.7627",
  Buford:"34.1207,-84.0044", Dacula:"33.9887,-83.89796", Doraville:"33.8982,-84.2833",
  Duluth:"34.0029,-84.1446", Grayson:"33.8943,-83.9557", Hoschton:"34.0979,-83.7613",
  Lawrenceville:"33.9562,-83.9880", Lilburn:"33.8901,-84.14297", Loganville:"33.8390,-83.9007",
  Mulberry:"34.055,-83.886", Norcross:"33.9412,-84.2135", "Peachtree Corners":"33.9699,-84.2215",
  "Rest Haven":"34.132,-83.978", Snellville:"33.8573,-84.0199", "Stone Mountain":"33.8082,-84.1702",
  "Sugar Hill":"34.1065,-84.0335", Suwanee:"34.0515,-84.0713", Tucker:"33.8545,-84.2171"
};
type Period = {startTime:string;isDaytime:boolean;temperature:number;shortForecast:string;probabilityOfPrecipitation?:{value:number|null}};
async function nws(url:string) {
  const response=await fetch(url,{headers:{"User-Agent":"All Things Gwinnett (https://allthingsgwinnett.com/contact)"},next:{revalidate:3600},signal:AbortSignal.timeout(3500)});
  if (!response.ok) throw new Error("Forecast unavailable");
  return response.json();
}
export async function forecast(city:string) {
  const location = Object.prototype.hasOwnProperty.call(locations,city) ? city : "Lawrenceville";
  const coords=locations[location];
  let periods:Period[]=[];
  try {
    const point=await nws("https://api.weather.gov/points/"+coords);
    const url=new URL(point.properties.forecast);
    if (url.origin==="https://api.weather.gov") periods=(await nws(url.href)).properties.periods;
  } catch { /* The event list remains available when NWS is offline. */ }
  return {location,link:"https://forecast.weather.gov/MapClick.php?lat="+coords.split(",")[0]+"&lon="+coords.split(",")[1],
    periods:periods.map(p=>({...p,day:localClock(p.startTime).slice(0,10)}))};
}
