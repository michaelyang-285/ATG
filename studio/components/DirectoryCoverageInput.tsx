import {useEffect,useState} from "react";
import {set,unset,type ArrayOfPrimitivesInputProps} from "sanity";

type Option = {id:string;name:string;area?:string};
export function DirectoryCoverageInput({value,onChange,readOnly}:ArrayOfPrimitivesInputProps) {
  const [options,setOptions] = useState<Option[]>([]);
  const [status,setStatus] = useState("Loading listings…");
  const selected = (value || []).filter((v):v is string=>typeof v==="string");
  useEffect(()=>{
    const controller = new AbortController();
    const origin = process.env.SANITY_STUDIO_DIRECTORY_ORIGIN || "https://atg-site-git-directory-owner-platform-285-marketing.vercel.app";
    fetch(origin+"/api/directory/coverage-options",{signal:controller.signal})
      .then(async response=>{
        if (!response.ok) throw new Error();
        const rows:Option[] = await response.json();
        setOptions(rows);
        setStatus(rows.length ? "" : "No published listings yet.");
      }).catch(()=>{if(!controller.signal.aborted) setStatus("Could not load directory listings. Reload to retry.");});
    return ()=>controller.abort();
  },[]);
  return <div>
    <select aria-label="Add related directory listing" disabled={readOnly || !options.length} value="" onChange={e=>onChange(set([...selected,e.currentTarget.value]))}>
      <option value="">Select a published listing</option>
      {options.filter(o=>!selected.includes(o.id)).map(o=><option key={o.id} value={o.id}>{o.name}{o.area ? " · "+o.area : ""}</option>)}
    </select>
    {status && <p role="status">{status}</p>}
    {selected.map(id=><p key={id}>{options.find(o=>o.id===id)?.name || id}{" "}
      <button type="button" disabled={readOnly} onClick={()=>{
        const next = selected.filter(v=>v!==id);
        onChange(next.length ? set(next) : unset());
      }}>Remove</button></p>)}
  </div>;
}
