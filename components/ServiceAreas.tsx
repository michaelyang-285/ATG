import {cities} from "@/lib/gwinnett";
export function ServiceAreas({value,onChange}:{value:string;onChange:(v:string)=>void}) {
  const selected = (value||"").split(",").map(v=>v.trim()).filter(Boolean);
  const options = Array.from(new Set([...cities,...selected]));
  const all = cities.every(city=>selected.includes(city));
  return <fieldset><legend>Cities you serve</legend>
    <label><input type="checkbox" checked={all} onChange={()=>onChange((all ? selected.filter(c=>!cities.includes(c)) : options).join(", "))}/> All of Gwinnett</label>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:8}}>
    {options.map(city=><label key={city}><input type="checkbox" checked={selected.includes(city)} onChange={()=>onChange((selected.includes(city)?selected.filter(c=>c!==city):[...selected,city]).join(", "))}/> {city}</label>)}
    </div></fieldset>;
}
