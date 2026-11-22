import type { Business } from "./publication";
import type { NavItem } from "@/components/SiteHeader";
export function navigation(
  businesses: Business[],
): NavItem[] {
  return [
    {
      label: "Food & drink",
      href: "/food-drink",
      children: [],
    },
    {
      label: "Things to do",
      href: "/things-to-do",
      children: [],
    },
    {
      label: "Events",
      href: "/events",
      children: [
        { label: "Events calendar", href: "/events" },
        { label: "Submit an event", href: "/events/submit" },
      ],
    },
    {
      label: "Local life",
      href: "/local-life",
      children: [],
    },
    {
      label: "Directory",
      href: "/directory",
      children: [
        { label: "Browse businesses", href: "/directory" },
        ...["Food", "Beauty", "Local services"]
          .filter((c) => businesses.some((b) => b.category === c))
          .map((c) => ({
            label: c,
            href: `/directory?category=${encodeURIComponent(c)}`,
          })),
        { label: "List your business", href: "/directory/submit" },
      ],
    },
  ];
}
