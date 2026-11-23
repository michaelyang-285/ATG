import type { DirectoryDeal } from "@/lib/directory/deal";

function dateLabel(day: string) {
  if (!Number.isFinite(Date.parse(day))) return day;
  return new Intl.DateTimeFormat("en-US", {month:"short", day:"numeric", year:"numeric", timeZone:"UTC"}).format(new Date(day));
}

export default function DealDetails({deal}: {deal: DirectoryDeal}) {
  const href = deal.channel === "call" ? "tel:" + deal.destination?.replace(/[^+0-9]/g,"")
    : deal.channel === "email" ? "mailto:" + deal.destination : deal.destination;
  return <>
    {deal.image && <img src={deal.image} alt="" width={600} height={450} style={{maxWidth:"100%",height:"auto"}}/>}
    <p>{deal.start ? dateLabel(deal.start) + " to " : "Valid through "}{dateLabel(deal.end)}</p>
    {deal.description && <p>{deal.description}</p>}
    <p><strong>How to redeem</strong><br/>{deal.terms}</p>
    {deal.code && <p>Promo code <strong>{deal.code}</strong></p>}
    {deal.link && <p><a href={deal.link} target="_blank" rel="noopener noreferrer">View deal details</a></p>}
    {deal.channel && href && <a className="button button-orange" href={href} target={deal.channel === "social" ? "_blank" : undefined} rel="noopener noreferrer">
      {deal.channel === "call" ? "Call the business" : deal.channel === "email" ? "Email the business" : "Reach out on social media"}
    </a>}
  </>;
}
