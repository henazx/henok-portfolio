"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

/** A subtle magnetic pull for primary actions on precise-pointer devices. */
export function Magnetic({
  children,
  className,
  strength = 0.16,
}: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let point: { x: number; y: number } | null = null;

    const paint = () => {
      frame = 0;
      if (!point) return;
      const rect = element.getBoundingClientRect();
      const dx = point.x - (rect.left + rect.width / 2);
      const dy = point.y - (rect.top + rect.height / 2);
      element.style.setProperty("--magnetic-x", `${dx * strength}px`);
      element.style.setProperty("--magnetic-y", `${dy * strength}px`);
    };

    const onMove = (event: PointerEvent) => {
      point = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onLeave = () => {
      point = null;
      element.style.setProperty("--magnetic-x", "0px");
      element.style.setProperty("--magnetic-y", "0px");
    };

    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerleave", onLeave);

    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`magnetic ${className ?? ""}`}>
      {children}
    </span>
  );
}
