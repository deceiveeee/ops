import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import { SessionProvider } from "@/lib/supabase/session";
import { ProgressProvider } from "@/lib/progress/store";
import { OnboardingProvider } from "@/lib/onboarding/store";
import { getSiteUrl } from "@/lib/site-url";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Open Portfolio Studio — Decode the market beneath the chart",
  description:
    "An interactive finance learning and portfolio studio. Investigate real companies, filings, portfolios, and market signals — not definitions.",
  metadataBase: getSiteUrl(),
  openGraph: {
    title: "Open Portfolio Studio",
    description: "Decode the market beneath the chart.",
    type: "website",
    url: getSiteUrl(),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <SessionProvider guestOnly>
          <OnboardingProvider>
            <ProgressProvider>
              <SiteShell>{children}</SiteShell>
            </ProgressProvider>
          </OnboardingProvider>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
