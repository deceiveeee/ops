import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Preview deployments must not be indexed.
 *
 * Every push publishes a preview carrying a full copy of the site on its own
 * hostname. Inviting crawlers into those means the same lessons compete with
 * production for the same queries, on hosts that stop existing — and the
 * cleanup is slower than the mistake.
 *
 * The test is deliberately "known to be something other than production" rather
 * than "not known to be production". `VERCEL_ENV` is absent when running
 * locally and on any non-Vercel host, and neither of those should silently lose
 * its rules; only a deployment that positively identifies itself as preview or
 * development is closed off.
 *
 * Nothing here is a security boundary. It asks well-behaved crawlers not to
 * index; keeping a preview genuinely private is what Vercel's deployment
 * protection is for.
 */
export default function robots(): MetadataRoute.Robots {
  const environment = process.env.VERCEL_ENV;
  if (environment && environment !== "production") {
    // No sitemap either. Naming one would undercut the request it accompanies.
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/login",
        "/signup",
        "/forgot-password",
      ],
    },
    sitemap: new URL("/sitemap.xml", getSiteUrl()).toString(),
  };
}
