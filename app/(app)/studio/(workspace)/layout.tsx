import StudioFrame from "@/components/studio/workspace/StudioFrame";
import "./workspace.css";

/**
 * The Studio workspace: every section shares one frame and one open project.
 *
 * A route group, so the URLs are /studio, /studio/goals and so on.
 */
export default function StudioWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <StudioFrame>{children}</StudioFrame>;
}
