"use client";

import { useEffect } from "react";

/**
 * Updates local glow coordinates only for the glass surface under the cursor.
 * A single document listener plus requestAnimationFrame keeps this cheap, and
 * touch devices and reduced-motion users get no listener at all.
 */
export function PointerGlow() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let active: HTMLElement | null = null;
    let point: { x: number; y: number } | null = null;

    const paint = () => {
      frame = 0;
      if (!active || !point) return;
      const rect = active.getBoundingClientRect();
      active.style.setProperty("--glow-x", `${point.x - rect.left}px`);
      active.style.setProperty("--glow-y", `${point.y - rect.top}px`);
    };

    const onMove = (event: PointerEvent) => {
      const target = event.target;
      const surface =
        target instanceof Element
          ? (target.closest("[data-glow]") as HTMLElement | null)
          : null;

      if (surface !== active) active = surface;
      if (!active) return;

      point = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onLeave = () => {
      active = null;
      point = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
