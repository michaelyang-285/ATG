export type DirectoryDeal = { title: string; terms: string; end: string; start?: string; description?: string; image?: string; code?: string; link?: string; channel?: string; destination?: string };
export function activeDeal(deal?: DirectoryDeal) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return deal && deal.end >= today && (!deal.start || deal.start <= today) ? deal : null;
}
