"use client";
import { county, places, zipAreas } from "@/lib/directory/locations";
import { useState } from "react";

export default function DirectoryLocation({initial}: {initial: string}) {
  const [value, setValue] = useState(initial || county);
  const zip = zipAreas[value.trim()];
  return <label>City or ZIP code
    <input name="area" list="directory-places" value={value} autoComplete="off"
      onFocus={event => event.currentTarget.select()} onChange={event => setValue(event.target.value)} />
    <datalist id="directory-places">
      <option value={county}/>
      {places.map(city => <option key={city} value={city}/>)}
      {Object.entries(zipAreas).map(([code, names]) => <option key={code} value={code}>{names.join(", ")}</option>)}
    </datalist>
    {zip && <span className="quiet">{zip.join(" · ")}</span>}
  </label>;
}
