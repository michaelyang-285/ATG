import { isGuide, sectionOf, type Story, type Business } from "./publication";
import type { NavItem } from "@/components/SiteHeader";
export function navigation(
  stories: Story[],
  businesses: Business[],
): NavItem[] {
  const has = (section: string, format: string) =>
    stories.some(
      (s) =>
        sectionOf(s) === section &&
        (format === "guide" ? isGuide(s) : s.format === format),
    );
  return [
    {
      label: "Food & drink",
      href: "/food-drink",
      children: [
        { label: "All food & drink", href: "/food-drink" },
        ...(has("food-drink", "guide")
          ? [{ label: "Food guides", href: "/food-drink?format=guide" }]
          : []),
        ...(has("food-drink", "review")
          ? [{ label: "Reviews", href: "/food-drink?format=review" }]
          : []),
        ...(has("food-drink", "opening")
          ? [
              {
                label: "Openings & closings",
                href: "/food-drink?format=opening",
              },
            ]
          : []),
      ],
    },
    {
      label: "Things to do",
      href: "/things-to-do",
      children: [
        { label: "All things to do", href: "/things-to-do" },
        ...(has("things-to-do", "guide")
          ? [{ label: "Weekend guides", href: "/things-to-do?format=guide" }]
          : []),
        ...(stories.some(
          (s) => sectionOf(s) === "things-to-do" && s.topic === "arts-culture",
        )
          ? [
              {
                label: "Arts & culture",
                href: "/things-to-do?topic=arts-culture",
              },
            ]
          : []),
      ],
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
      children: [
        { label: "All local life", href: "/local-life" },
        ...(stories.some(
          (s) =>
            sectionOf(s) === "local-life" && s.topic === "schools-development",
        )
          ? [
              {
                label: "Schools & development",
                href: "/local-life?topic=schools-development",
              },
            ]
          : []),
        ...(has("local-life", "news")
          ? [{ label: "Local news", href: "/local-life?format=news" }]
          : []),
        ...(has("local-life", "opinion")
          ? [{ label: "Community voices", href: "/local-life?format=opinion" }]
          : []),
        ...(has("local-life", "guide")
          ? [{ label: "Neighborhood guides", href: "/local-life?format=guide" }]
          : []),
      ],
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
