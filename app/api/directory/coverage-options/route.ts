import {directoryPublic} from "@/lib/directory/public";
import {publication} from "@/lib/publication";

export const revalidate = 60;
export async function GET() {
  const [local, editorial] = await Promise.all([
    directoryPublic(),
    publication.fetch<{id:string;name:string;area?:string}[]>('*[_type=="business" && defined(slug.current)]{"id":"sanity:"+_id,name,"area":neighborhood}', {}, {next:{revalidate:60}})
  ]);
  const options = [...editorial,...local.map(b=>({id:"local:"+b._id,name:b.name,area:b.neighborhood}))];
  return Response.json(options.sort((a,b)=>a.name.localeCompare(b.name)),{headers:{"Access-Control-Allow-Origin":"*"}});
}
