import { OG_CONTENT_TYPE, OG_SIZE, textCard } from "@/lib/og/card";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Investing Studio: learn investing and build a portfolio you can explain";

export default async function SiteImage() {
  return textCard({
    title: "Learn investing. Build a portfolio you can explain.",
    description: "Interactive finance courses. Explore company reports, set portfolio goals, compare investments and test your assumptions.",
    footer: "Interactive finance lessons and company research",
  });
}
