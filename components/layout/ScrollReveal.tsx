"use client";

import { useEffect } from "react";

/**
 * Adds a single scroll-reveal observer for every element marked with
 * `data-reveal`. Content stays visible when JavaScript is unavailable or the
 * visitor prefers reduced motion, so this is a purely progressive enhancement.
 */
export function ScrollReveal() {
  // Decorative CSS animations keep running in background tabs in some
  // browsers. Pause the whole backdrop while the document is hidden.
  useEffect(() => {
    const root = document.documentElement;
    const syncVisibility = () => {
      if (document.hidden) {
        root.setAttribute("data-document-hidden", "true");
      } else {
        root.removeAttribute("data-document-hidden");
      }
    };

    document.addEventListener("visibilitychange", syncVisibility);
    syncVisibility();
    return () => {
      document.removeEventListener("visibilitychange", syncVisibility);
      root.removeAttribute("data-document-hidden");
    };
  }, []);

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

    const registered = new WeakSet<Element>();

    const register = (element: Element, immediate = false) => {
      if (registered.has(element)) return;
      registered.add(element);

      // Editor updates create entirely new nodes. Reveal those immediately so
      // changing one item can never leave the replacement cards stuck in the
      // hidden pre-reveal state.
      if (immediate || element.getBoundingClientRect().bottom < 0) {
        element.classList.add("is-revealed");
        return;
      }

      observer.observe(element);
    };

    for (const element of elements) {
      register(element);
    }

    // The private editor can add or replace content after mount. Newly rendered
    // [data-reveal] elements must join the same observer, otherwise they inherit
    // the hidden pre-reveal style forever and look as though they disappeared.
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches("[data-reveal]")) register(node, true);
          node.querySelectorAll("[data-reveal]").forEach((element) =>
            register(element, true),
          );
        }
      }
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
