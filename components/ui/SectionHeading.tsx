import type { ReactNode } from "react";

import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  titleId?: string;
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  titleId,
}: SectionHeadingProps) {
  return (
    <header className={styles.header} data-reveal>
      <div className={styles.meta}>
        <span className={styles.index}>{index}</span>
        <span className={styles.label}>{eyebrow}</span>
        <span className={styles.line} aria-hidden="true" />
      </div>
      <div className={styles.titleRow}>
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
    </header>
  );
}
