type TextBlock = { children?: {text?: string}[] };
type GuideBlock = TextBlock & {
  _type: string;
  style?: string;
  markDefs?: {href?: string}[];
  items?: {question: string; answer: TextBlock[]}[];
};
export type GuideRestaurant = {slug: string; name: string; address?: string};

function plainText(block: TextBlock) {
  return (block.children || []).map(span => span.text || "").join("").trim();
}

export function tacoGuideSchema(canonical: string, title: string, body: GuideBlock[], profiles: GuideRestaurant[]) {
  const origin = new URL(canonical).origin;
  const sections: {name: string; blocks: GuideBlock[]}[] = [];
  let current: typeof sections[number] | undefined;
  for (const block of body) {
    if (block.style === "h2") {
      const heading = plainText(block).match(/^\d+\.\s+(.+)/);
      current = heading ? {name: heading[1].split(" | ")[0], blocks: []} : undefined;
      if (current) sections.push(current);
    } else {
      current?.blocks.push(block);
    }
  }
  const entries = sections.map((section, i) => {
    const links = section.blocks.flatMap(block => (block.markDefs || []).map(mark => mark.href));
    const profile = profiles.find(p => links.includes(origin + "/directory/" + p.slug));
    const entry = {"@type": "ListItem", position: i + 1, name: section.name};
    if (!profile) return entry;
    const url = origin + "/directory/" + profile.slug;
    const phone = section.blocks.map(plainText).join(" ").match(/\b\d{3}-\d{3}-\d{4}\b/);
    return {...entry, item: {"@type": "Restaurant", "@id": url + "#listing", url,
      name: profile.name, address: profile.address, telephone: phone?.[0], servesCuisine: "Mexican"}};
  });
  const questions = body.filter(block => block._type === "faq").flatMap(block =>
    (block.items || []).map(item => ({"@type": "Question", name: item.question,
      acceptedAnswer: {"@type": "Answer", text: item.answer.map(plainText).join("\n")}}))
  );
  return {
    mainEntity: {"@type": "ItemList", "@id": canonical + "#taco-spots", name: title,
      itemListOrder: "https://schema.org/ItemListUnordered", numberOfItems: entries.length, itemListElement: entries},
    ...(questions.length > 0 && {hasPart: {"@type": "FAQPage", "@id": canonical + "#faq", mainEntity: questions}}),
    mainEntityOfPage: {"@type": "WebPage", "@id": canonical, url: canonical,
      breadcrumb: {"@type": "BreadcrumbList", itemListElement: [
        {"@type": "ListItem", position: 1, name: "All Things Gwinnett", item: origin + "/"},
        {"@type": "ListItem", position: 2, name: "Food & drink", item: origin + "/food-drink"},
        {"@type": "ListItem", position: 3, name: title, item: canonical}
      ]}}
  };
}
