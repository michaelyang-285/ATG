import type { Draft } from "./OwnerDashboard";
import OperatingHours from "./OperatingHours";
import { networks } from "@/lib/directory/social";
import { directoryThumbnail } from "@/lib/directory/thumbnail";

export default function ListingPreview({ data: d }: { data: Partial<Draft> & {deal?:import("@/lib/directory/deal").DirectoryDeal} }) {
  const deal = d.dealTitle !== undefined ? {title:d.dealTitle,terms:d.dealTerms,end:d.dealEnd} : d.deal;
  return (
    <article>
      {d.logo ? (
        <img src={d.logo} alt="" width={80} height={80} />
      ) : (
        <strong>
          {d.name
            ?.split(/\s+/)
            .slice(0, 2)
            .map((v) => v[0])
            .join("")}
        </strong>
      )}
      <h3>{d.name}</h3>
      <p>
        {[d.category, ...(d.categories || []), ...(d.services || [])]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <p>{d.summary}</p>
      {deal?.title && <section><h4>{deal.title}</h4><p>{deal.terms}</p><p>Valid through {deal.end}</p></section>}
      {[
        d.neighborhood,
        d.hideAddress ? "" : (d.streetAddress ? [d.streetAddress, d.city, "GA " + d.zip].join(", ") : d.address),
        d.hidePhone ? "" : d.businessPhone || d.publicPhone,
        d.url,
        d.booking,
        ...networks.map(n=>d[n.key]),
        d.social,
      ]
        .filter(Boolean)
        .map((v, i) => (
          <p key={i}>{v}</p>
        ))}
      <OperatingHours week={d.weeklyHours} legacy={d.hours} />
      {d.gallery?.map((src) => (
        <img key={src} src={directoryThumbnail(src)} alt="Work sample" width={100} />
      ))}
    </article>
  );
}
