import {landings,grocery} from "@/lib/directory/browse-groups";
import {categoryStyle} from "@/lib/directory/share-categories";
import {directoryImage} from "@/lib/directory/share-image";

export function generateStaticParams() {
  return Object.keys(landings).map(group=>({group}));
}
export const dynamicParams = false;
export async function GET(_request:Request,{params}:{params:{group:string}}) {
  const {name}=landings[params.group];
  const style=categoryStyle(name);
  return directoryImage({...style,asset:name===grocery?"grocery-market":params.group,
    label:"Business directory",location:"Gwinnett County",name,detail:""});
}
