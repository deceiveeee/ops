import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChosenHomePage from "@/components/marketing/ChosenHomePage";
import { HOMEPAGE_VERSIONS, type HomepageVersion } from "@/lib/homepage-version";

/**
 * Either homepage, whichever one "/" shows: /homepage/current and
 * /homepage/classic, for comparing them on the live site before choosing.
 * Kept out of search results and out of the sitemap, so "/" stays the only
 * homepage anyone finds.
 */
export const revalidate = 60;

export function generateStaticParams() {
  return HOMEPAGE_VERSIONS.map((version) => ({ version }));
}

const isVersion = (value: string): value is HomepageVersion => (HOMEPAGE_VERSIONS as readonly string[]).includes(value);

export function generateMetadata({ params }: { params: { version: string } }): Metadata {
  return {
    title: params.version === "classic" ? "Earlier homepage — Investing Studio" : "Homepage — Investing Studio",
    robots: { index: false, follow: false },
  };
}

export default function HomepageVersionPage({ params }: { params: { version: string } }) {
  if (!isVersion(params.version)) notFound();
  return <ChosenHomePage version={params.version} />;
}
