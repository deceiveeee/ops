"use client";

import { usePathname } from "next/navigation";
import { routeTheme } from "@/lib/route-theme";
import { cn } from "@/lib/utils";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const theme = routeTheme(pathname);

  return (
    <div
      className={cn(
        "site-shell",
        theme === "light" ? "ops-theme-light" : "site-shell-dark",
      )}
    >
      <SiteHeader />
      <main className="site-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
