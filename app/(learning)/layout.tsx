import SiteShell from "@/components/layout/SiteShell";

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell theme="light">{children}</SiteShell>;
}
