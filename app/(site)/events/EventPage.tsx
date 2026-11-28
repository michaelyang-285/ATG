import type { ReactNode } from "react";
import styles from "./[slug]/event.module.css";

type EventPageProps = {
  title: string;
  navigation: ReactNode;
  details: ReactNode;
  schema: object;
  description?: string;
  organizer?: string;
  notice?: ReactNode;
  actions?: ReactNode;
};

export function EventPage({ title, navigation, details, schema, description, organizer, notice, actions }: EventPageProps) {
  return <main id="main" className="site-width page-content">
    <article className={styles.event}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      {navigation}
      <h1>{title}</h1>
      {notice}
      <dl className={styles.details}>{details}</dl>
      {description && <p className={styles.description}>{description}</p>}
      {organizer && <p className={styles.organizer}>Organized by <strong>{organizer}</strong></p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </article>
  </main>;
}
