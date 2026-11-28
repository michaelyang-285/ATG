import type { NavItem } from "@/components/SiteHeader";
export function navigation(): NavItem[] {
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
      label: "Local life",
      href: "/local-life",
      children: [],
    },
    {
      label: "Events",
      href: "/events",
      // Keep specialty calendars on the Events Calendar page.
      children: [
        { label: "Events Calendar", href: "/events" },
        { label: "Submit an Event", href: "/events/submit" },
      ],
    },
    {
      label: "Directory",
      href: "/directory",
      children: [
        { label: "Browse businesses", href: "/directory" },
        { label: "List your business", href: "/directory/submit" },
      ],
    },
  ];
}
