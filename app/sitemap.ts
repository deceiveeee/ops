import type { MetadataRoute } from "next";
import { getAllLessons } from "@/data/courses";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const paths = [
    "/",
    "/courses",
    "/courses/finance-foundations",
    "/courses/investment-foundations",
    "/plan",
    "/filings",
    "/studio",
    "/studio/industry",
    "/studio/investigate",
    "/start",
    "/privacy",
    "/terms",
    ...getAllLessons().map(({ lesson }) => `/lessons/${lesson.slug}`),
  ];

  // Legal pages belong in the sitemap so they are findable, but they are not
  // what anyone comes here for.
  const legal = new Set(["/privacy", "/terms"]);

  return paths.map((path) => ({
    url: new URL(path, base).toString(),
    changeFrequency: legal.has(path) ? "yearly" : path.startsWith("/lessons/") ? "monthly" : "weekly",
    priority: path === "/" ? 1 : legal.has(path) ? 0.3 : path.startsWith("/lessons/") ? 0.6 : 0.8,
  }));
}
