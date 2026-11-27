"use client";

import { useEffect, useRef } from "react";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
  FigmaIcon,
  GitHubIcon,
  MySqlIcon,
  NextIcon,
  NodeIcon,
  ReactIcon,
  TypeScriptIcon,
} from "@/components/ui/BrandIcons";
import styles from "./TechEcosystem.module.css";

const technologies = [
  { key: "react", label: "React", Icon: ReactIcon, depth: 1, x: 120, y: 64 },
  { key: "next", label: "Next.js", Icon: NextIcon, depth: 0.8, x: 342, y: 34 },
  {
    key: "typescript",
    label: "TypeScript",
    Icon: TypeScriptIcon,
    depth: 1.15,
    x: 626,
    y: 44,
  },
  { key: "node", label: "Node.js", Icon: NodeIcon, depth: 0.9, x: 880, y: 78 },
  { key: "mysql", label: "MySQL", Icon: MySqlIcon, depth: 1.05, x: 766, y: 292 },
  {
    key: "github",
    label: "GitHub",
    Icon: GitHubIcon,
    depth: 0.75,
    x: 426,
    y: 320,
  },
  { key: "figma", label: "Figma", Icon: FigmaIcon, depth: 1.2, x: 146, y: 268 },
] as const;

/**
 * The signature interaction: a lightweight constellation of the technologies
 * used in the portfolio. Purely decorative — the accessible skill list lives
 * in the cards below it.
 */
export function TechEcosystem() {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const coreLabel = t("Core stack").split(/\s+/);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const chips = Array.from(
      container.querySelectorAll<HTMLElement>("[data-orbit-chip]"),
    );
    const links = container.querySelector<HTMLElement>("[data-orbit-links]");
    let frame = 0;
    let point: { x: number; y: number } | null = null;

    const paint = () => {
      frame = 0;
      if (!point) return;
      const rect = container.getBoundingClientRect();
      const nx = (point.x - rect.left) / rect.width - 0.5;
      const ny = (point.y - rect.top) / rect.height - 0.5;

      for (const chip of chips) {
        const depth = Number(chip.dataset.depth ?? 1);
        chip.style.setProperty("--chip-x", `${nx * 34 * depth}px`);
        chip.style.setProperty("--chip-y", `${ny * 24 * depth}px`);
      }

      links?.style.setProperty("--link-x", `${nx * 10}px`);
      links?.style.setProperty("--link-y", `${ny * 8}px`);
    };

    const onMove = (event: PointerEvent) => {
      point = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onLeave = () => {
      point = null;
      for (const chip of chips) {
        chip.style.setProperty("--chip-x", "0px");
        chip.style.setProperty("--chip-y", "0px");
      }
      links?.style.setProperty("--link-x", "0px");
      links?.style.setProperty("--link-y", "0px");
    };

    container.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("pointerleave", onLeave);

    return () => {
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.ecosystem} ref={ref} aria-hidden="true">
      <svg
        className={styles.links}
        viewBox="0 0 1000 360"
        preserveAspectRatio="none"
        focusable="false"
      >
        <g className={styles.linkGroup} data-orbit-links>
          {technologies.map((technology) => (
            <line
              key={technology.key}
              x1="500"
              y1="180"
              x2={technology.x}
              y2={technology.y}
            />
          ))}
        </g>
      </svg>

      <div className={styles.core}>
        <span className={styles.coreRing} />
        <span className={styles.coreDot} />
        <span className={styles.coreLabel}>
          {coreLabel[0]}
          {coreLabel.length > 1 ? (
            <>
              <br />
              {coreLabel.slice(1).join(" ")}
            </>
          ) : null}
        </span>
      </div>

      {technologies.map(({ key, label, Icon, depth }) => (
        <div
          key={key}
          className={`${styles.chip} ${styles[key]}`}
          data-orbit-chip
          data-depth={depth}
        >
          <Icon className={styles.icon} />
          <span>{t(label)}</span>
        </div>
      ))}
    </div>
  );
}
