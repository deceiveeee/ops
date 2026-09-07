/**
 * The site's one canonical origin, used for `metadataBase`, the Open Graph URL,
 * `robots.txt` and every entry in the sitemap.
 *
 * The order below is the whole point of this file, and the previous order was
 * wrong. `VERCEL_URL` is the *deployment's* own hostname — a different one for
 * every push, like `ops-c2b0exh00-deceiveeees-projects.vercel.app` — so
 * preferring it meant each deployment declared a different canonical URL,
 * published an Open Graph link that broke on the next push, and emitted a
 * sitemap listing its own throwaway host rather than the real site.
 *
 * `VERCEL_PROJECT_PRODUCTION_URL` is the stable one. It also resolves to the
 * custom domain as soon as a custom domain is attached to the project, so
 * pointing this site at a real domain needs no code change and no environment
 * variable — attaching the domain in Vercel is the whole job.
 *
 * `NEXT_PUBLIC_SITE_URL` stays ahead of both as the explicit override, for a
 * domain Vercel does not know it is serving (a proxy or a redirect in front).
 * `VERCEL_URL` remains last so a preview deployment can still resolve links to
 * itself when there is nothing better.
 */
function firstConfigured(...values: (string | undefined)[]): string | undefined {
  // Not `??`: an environment variable defined-but-blank is a string, so it
  // passes a nullish check and then `new URL("")` throws and takes the build
  // with it. Vercel's dashboard makes an empty value easy to create, so this
  // treats blank and whitespace as "not set" — which is what someone who left
  // the box empty meant.
  return values.map((value) => value?.trim()).find((value) => value);
}

export function getSiteUrl(): URL {
  const configured = firstConfigured(
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  );
  if (!configured) return new URL("http://localhost:3000");
  return new URL(configured.startsWith("http") ? configured : `https://${configured}`);
}
