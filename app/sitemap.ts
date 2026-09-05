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
    "/start",
    ...getAllLessons().map(({ lesson }) => `/lessons/${lesson.slug}`),
  ];

  return paths.map((path) => ({
    url: new URL(path, base).toString(),
    changeFrequency: path.startsWith("/lessons/") ? "monthly" : "weekly",
    priority: path === "/" ? 1 : path.startsWith("/lessons/") ? 0.6 : 0.8,
  }));
}
