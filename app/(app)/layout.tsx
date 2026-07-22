import SiteShell from "@/components/layout/SiteShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell theme="dark">{children}</SiteShell>;
}
