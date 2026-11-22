import type { ReactNode } from "react";
import "./FaqAccordion.css";

type Item = { question: string; answer: ReactNode; key?: string };

export function FaqAccordion({ items }: { items: Item[] }) {
  return (
    <div className="atg-faq">
          {items.map(({ question, answer, key }) => (
            <details key={key || question}>
              <summary>
                <span>{question}</span>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="m4 7 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className="atg-faq-answer">{answer}</div>
            </details>
          ))}
        </div>
  );
}
