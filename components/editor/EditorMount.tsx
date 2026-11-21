"use client";

import dynamic from "next/dynamic";

import { useEditor } from "./ContentProvider";

// The editor, its field controls, and the GitHub publish flow are only needed
// after a successful authenticated session. Keep them out of the public bundle.
const SiteEditor = dynamic(
  () => import("./SiteEditor").then((module) => module.SiteEditor),
  { ssr: false },
);

export function EditorMount() {
  const { unlocked } = useEditor();
  return unlocked ? <SiteEditor /> : null;
}
