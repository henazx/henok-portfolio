"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

import { bypassImageOptimization } from "@/lib/image";
import type { ProjectImage } from "@/types";
import styles from "./ProjectLightbox.module.css";

interface ProjectLightboxProps {
  images: ProjectImage[];
  projectName: string;
  className?: string;
  label?: string;
  children?: ReactNode;
}

export function ProjectLightbox({
  images,
  projectName,
  className,
  label,
  children,
}: ProjectLightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const isOpen = openIndex !== null;

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const restoreTarget = triggerRef.current ?? previousFocus;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpenIndex(null);
        return;
      }

      if (event.key === "ArrowRight" && images.length > 1) {
        event.preventDefault();
        setOpenIndex((current) =>
          current === null ? null : (current + 1) % images.length,
        );
        return;
      }

      if (event.key === "ArrowLeft" && images.length > 1) {
        event.preventDefault();
        setOpenIndex((current) =>
          current === null ? null : (current - 1 + images.length) % images.length,
        );
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreTarget?.focus();
    };
  }, [isOpen, images.length]);

  if (images.length === 0) return null;

  const activeIndex = Math.min(openIndex ?? 0, images.length - 1);
  const active = images[activeIndex];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${className ?? ""}`}
        onClick={() => setOpenIndex(0)}
        aria-label={label ?? `View ${projectName} images in full size`}
      >
        {children ?? <Maximize2 aria-hidden="true" />}
      </button>

      {openIndex !== null ? (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpenIndex(null);
          }}
        >
          <div
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-label={`${projectName} image gallery`}
          >
            <div className={styles.bar}>
              <span>
                {projectName} · {activeIndex + 1} / {images.length}
              </span>
              <button
                ref={closeRef}
                type="button"
                className={styles.iconButton}
                onClick={() => setOpenIndex(null)}
                aria-label="Close image gallery"
              >
                <X aria-hidden="true" />
              </button>
            </div>

            <div className={styles.stage}>
              <Image
                key={active.src}
                src={active.src}
                alt={active.alt}
                fill
                unoptimized={bypassImageOptimization(active.src)}
                sizes="100vw"
                className={styles.image}
              />

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    className={`${styles.iconButton} ${styles.previous}`}
                    onClick={() =>
                      setOpenIndex(
                        (activeIndex - 1 + images.length) % images.length,
                      )
                    }
                    aria-label="Previous image"
                  >
                    <ChevronLeft aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconButton} ${styles.next}`}
                    onClick={() =>
                      setOpenIndex((activeIndex + 1) % images.length)
                    }
                    aria-label="Next image"
                  >
                    <ChevronRight aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>

            {active.alt ? (
              <p className={styles.caption}>{active.alt}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
