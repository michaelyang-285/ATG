"use client";
import { county, places, zipAreas } from "@/lib/directory/locations";
import { useRef, useState } from "react";

const options = [county, ...places, ...Object.keys(zipAreas)];
export default function DirectoryLocation({initial}: {initial: string}) {
  const [value, setValue] = useState(initial || county);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const shown = editing ? options.filter(item => item.toLowerCase().includes(value.trim().toLowerCase())) : options;
  function choose(item: string) {
    setValue(item);
    setEditing(false);
    setOpen(false);
    setActive(-1);
  }
  function move(index: number) {
    setActive(index);
    document.getElementById("location-option-" + index)?.scrollIntoView({block:"nearest"});
  }
  return <div className="location-picker" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <label htmlFor="directory-location">City or ZIP code</label>
    <div className="location-field">
      <input id="directory-location" ref={input} name="area" role="combobox" aria-autocomplete="list"
        aria-expanded={open} aria-controls="directory-locations" aria-activedescendant={open && active >= 0 ? "location-option-" + active : undefined}
        autoComplete="off" value={value}
        onFocus={event => {event.target.select(); setOpen(true);}}
        onClick={() => setOpen(true)}
        onChange={event => {setValue(event.target.value); setEditing(true); setActive(-1); setOpen(true);}}
        onKeyDown={event => {
          if (event.key === "Escape") {setOpen(false); return;}
          if (event.key === "Enter" && open && shown[active]) {event.preventDefault(); choose(shown[active]);}
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setOpen(true);
            move(event.key === "ArrowDown" ? Math.min(active + 1, shown.length - 1) : Math.max(active - 1, shown.length ? 0 : -1));
          }
        }}/>
      <button type="button" aria-label="Show or hide locations" aria-expanded={open}
        onMouseDown={event => event.preventDefault()} onClick={() => {input.current?.focus(); setEditing(false); setActive(-1); setOpen(!open);}}>⌄</button>
    </div>
    <ul id="directory-locations" role="listbox" aria-label="Locations" hidden={!open || !shown.length}>
      {shown.map((item,index) => <li id={"location-option-" + index} key={item} role="option" aria-selected={index === active}
        onMouseDown={event => event.preventDefault()} onClick={() => choose(item)}>{item}{zipAreas[item] && " · " + zipAreas[item].join(", ")}</li>)}
    </ul>
  </div>;
}
