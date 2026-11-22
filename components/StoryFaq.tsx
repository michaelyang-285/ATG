import { PortableText } from "@portabletext/react";
import { FaqAccordion } from "./FaqAccordion";

export function StoryFaq({ value }: { value: any }) {
  if (!value?.items?.length) return null;
  return <section className="my-12">
    <h2>{value.heading || "Frequently asked questions"}</h2>
    <FaqAccordion items={value.items.map((item: any) => ({
      key: item._key, question: item.question, answer: <PortableText value={item.answer || []} />,
    }))} />
  </section>;
}
