import { DirectionIcon } from "./DirectionIcon";

const outings = [
  {
    city: "Lawrenceville",
    name: "Tribble Mill Park",
    description: "Bring a bike for the 3.4-mile paved trail or a fishing rod for the lake. The playground and picnic pavilions are at the Tribble Mill Parkway entrance.",
    action: "Park entrances and trails",
    href: "https://www.gwinnettcounty.com/government/departments/parks-recreation/parks/tribble-mill",
  },
  {
    city: "Duluth",
    name: "Southeastern Railway Museum",
    description: "See full-size locomotives and passenger cars on Buford Highway. If a train ride is the draw for your kids, check the departure times before you go.",
    action: "Museum hours and train rides",
    href: "https://www.train-museum.org/",
  },
  {
    city: "Sugar Hill",
    name: "The Eagle Theatre",
    description: "Pick a concert or a play on West Broad Street, then walk to dinner in downtown Sugar Hill. The box office lists showtimes and tickets by performance.",
    action: "Shows and tickets",
    href: "https://www.eagleatsugarhill.com/events-tickets/",
  },
];

export default function PlacesToGo() {
  return <section id="places-to-go"><h2>Places to go in Gwinnett</h2>
    <ul className="sf-outings">{outings.map(p => <li key={p.href}>
      <h3>{p.name}</h3><small>{p.city}</small><p>{p.description}</p>
      <a className="sf-action" href={p.href} target="_blank" rel="noopener noreferrer">{p.action} <DirectionIcon external /></a>
    </li>)}</ul></section>;
}
