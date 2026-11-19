"use client";

import { useEffect } from "react";

/**
 * Adds a single scroll-reveal observer for every element marked with
 * `data-reveal`. Content stays visible when JavaScript is unavailable or the
 * visitor prefers reduced motion, so this is a purely progressive enhancement.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    if (elements.length === 0) {
      return;
    }

    const root = document.documentElement;
    root.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    for (const element of elements) {
      // Anything already scrolled past (for example after an anchor jump)
      // should be visible immediately rather than waiting for an intersection.
      if (element.getBoundingClientRect().bottom < 0) {
        element.classList.add("is-revealed");
      } else {
        observer.observe(element);
      }
    }

    return () => {
      observer.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
