"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { useWorkspace } from "./WorkspaceProvider";

/**
 * Content that belongs beside the work it explains.
 *
 * From 1280px it is drawn in the frame's side panel, next to the numbers.
 * Below that there is no room beside the work, so it stays where the page puts
 * it. Both are rendered and CSS shows one, so neither waits on the other and
 * the main column does not jump when the panel appears.
 */
export default function StudioAside({ inline, beside }: { inline: ReactNode; beside: ReactNode }) {
  const { asideSlot } = useWorkspace();
  // No panel to draw into (yet): keep the content in the page at every width.
  if (!asideSlot) return <>{inline}</>;
  return (
    <>
      <div className="xl:hidden">{inline}</div>
      {createPortal(beside, asideSlot)}
    </>
  );
}
