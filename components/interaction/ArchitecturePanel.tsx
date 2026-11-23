"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Boxes,
  Database,
  GitBranch,
  Layers3,
  Server,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { ArchitectureLayer } from "@/types";
import styles from "./ArchitecturePanel.module.css";

const layerIcons: LucideIcon[] = [
  Layers3,
  Server,
  Database,
  GitBranch,
  ShieldCheck,
  Boxes,
];

export function ArchitecturePanel({ layers }: { layers: ArchitectureLayer[] }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const idBase = useId().replace(/:/g, "");

  if (layers.length === 0) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      next = (index + 1) % layers.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      next = (index - 1 + layers.length) % layers.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = layers.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  const selected = layers[active] ?? layers[0];
  const Icon = layerIcons[active % layerIcons.length];

  return (
    <div className={styles.panel}>
      <div className={styles.flow} aria-hidden="true">
        {layers.map((layer, index) => (
          <div
            key={`flow-${layer.title}`}
            className={`${styles.flowNode} ${active === index ? styles.flowNodeActive : ""}`}
          >
            <span className={styles.flowIndex}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={styles.flowLabel}>
              <strong>{t(layer.title)}</strong>
              {layer.subtitle ? <small>{t(layer.subtitle)}</small> : null}
            </span>
          </div>
        ))}
      </div>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label={t("System architecture layers")}
        aria-orientation="vertical"
      >
        {layers.map((layer, index) => (
          <button
            key={layer.title}
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
            <span className={styles.tabIndex} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>
              <strong>{t(layer.title)}</strong>
              {layer.subtitle ? <small>{t(layer.subtitle)}</small> : null}
            </span>
          </button>
        ))}
      </div>

      <div
        className={styles.content}
        id={`${idBase}-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`${idBase}-tab-${active}`}
        tabIndex={0}
      >
        <div className={styles.contentHead}>
          <span className={styles.contentIcon} aria-hidden="true">
            <Icon />
          </span>
          <div>
            <p className="mono">{t("Selected layer")}</p>
            <h3>{t(selected.title)}</h3>
          </div>
        </div>

        {selected.subtitle ? (
          <p className={styles.subtitle}>{t(selected.subtitle)}</p>
        ) : null}

        <ol className={styles.nodes}>
          {selected.nodes.map((node, index) => (
            <li key={`${node.title}-${index}`}>
              <span className={styles.nodeMarker} aria-hidden="true" />
              <div>
                <h4>{t(node.title)}</h4>
                <p>{t(node.description)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
