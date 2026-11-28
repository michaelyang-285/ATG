"use client";
import {useEffect,useRef, type ReactNode} from "react";
export default function DirectoryMetrics({children,view}:{children:ReactNode;view:string}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const node = root.current;
    if (!node) return;
    const timers = new Map<Element,ReturnType<typeof setTimeout>>();
    const seen = new Set<string>();
    const visible = new Set<HTMLElement>();
    const emit = (event:string, el:HTMLElement) => {
      const gtag = (window as Window & {gtag?:Function}).gtag;
      gtag?.("event",event,{listing_id:el.dataset.listing,placement:el.dataset.placement,listing_category:el.dataset.category});
    };
    function stop(el:Element) {clearTimeout(timers.get(el));timers.delete(el);}
    function start(el:HTMLElement) {
      const key = el.dataset.placement + "/" + el.dataset.listing;
      if(document.hidden || seen.has(key) || timers.has(el)) return;
      timers.set(el,setTimeout(()=>{seen.add(key);timers.delete(el);emit("directory_listing_impression",el);},1000));
    }
    const observer = new IntersectionObserver(entries=>{
      for(const entry of entries) {
        const el = entry.target as HTMLElement;
        if(entry.intersectionRatio >= 0.5) {visible.add(el);start(el);}
        else {visible.delete(el);stop(el);}
      }
    },{threshold:[0,0.5]});
    node.querySelectorAll("[data-listing]").forEach(el=>observer.observe(el));
    const visibility = ()=>visible.forEach(el=>document.hidden ? stop(el) : start(el));
    const click = (e:MouseEvent)=>{
      const el = (e.target as Element).closest("[data-profile]")?.closest<HTMLElement>("[data-listing]");
      if(el) emit("directory_profile_click",el);
    };
    document.addEventListener("visibilitychange",visibility);
    node.addEventListener("click",click);
    return ()=>{observer.disconnect();timers.forEach(clearTimeout);document.removeEventListener("visibilitychange",visibility);node.removeEventListener("click",click);};
  },[view]);
  return <div ref={root}>{children}</div>;
}
