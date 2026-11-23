"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowUpRight,
  Boxes,
  Database,
  LayoutTemplate,
  PenTool,
  Server,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { SkillCategory, SkillIcon } from "@/types";
import styles from "./SkillMap.module.css";

const icons: Record<SkillIcon, LucideIcon> = {
  frontend: LayoutTemplate,
  backend: Server,
  database: Database,
  support: Wrench,
  design: PenTool,
  tools: Boxes,
};

export function SkillMap({ categories }: { categories: SkillCategory[] }) {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const idBase = useId().replace(/:/g, "");

  if (categories.length === 0) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % categories.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + categories.length) % categories.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = categories.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  const selected = categories[active] ?? categories[0];
  const Icon = icons[selected.icon];
  const evidenceHref = selected.evidenceHref?.trim();
  const evidenceLabel = selected.evidenceLabel?.trim();
  const externalEvidence = evidenceHref?.startsWith("https://");

  return (
    <section className={styles.map} aria-labelledby={`${idBase}-title`}>
      <div className={styles.heading}>
        <p className="mono">Skill relationships</p>
        <h3 id={`${idBase}-title`}>Choose an area to see where it appears</h3>
        <p>
          Each group links to a project or role that demonstrates the work —
          no invented proficiency scores.
        </p>
      </div>

      <div className={styles.layout}>
        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Skill categories"
        >
          {categories.map((category, index) => {
            const CategoryIcon = icons[category.icon];
            return (
              <button
                key={`${category.title}-${index}`}
                ref={(element) => {
                  tabsRef.current[index] = element;
                }}
                id={`${idBase}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-controls={`${idBase}-panel-${index}`}
                tabIndex={active === index ? 0 : -1}
                className={`${styles.tab} ${active === index ? styles.tabActive : ""}`}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                <CategoryIcon aria-hidden="true" />
                <span>{category.title}</span>
              </button>
            );
          })}
        </div>

        <div
          className={styles.panel}
          id={`${idBase}-panel-${active}`}
          role="tabpanel"
          aria-labelledby={`${idBase}-tab-${active}`}
          tabIndex={0}
        >
          <div className={styles.panelHead}>
            <span className={styles.icon} aria-hidden="true">
              <Icon />
            </span>
            <div>
              <h4>{selected.title}</h4>
              <p>{selected.description}</p>
            </div>
          </div>

          <ul className={styles.skills}>
            {selected.skills.map((skill, index) => (
              <li key={`${skill}-${index}`}>{skill}</li>
            ))}
          </ul>

          {evidenceHref && evidenceLabel ? (
            <a
              className={styles.evidence}
              href={evidenceHref}
              target={externalEvidence ? "_blank" : undefined}
              rel={externalEvidence ? "noopener noreferrer" : undefined}
              aria-label={`${evidenceLabel}${externalEvidence ? " (opens in a new tab)" : ""}`}
            >
              {evidenceLabel}
              <ArrowUpRight aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
