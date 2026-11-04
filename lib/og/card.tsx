import { ImageResponse } from "next/og";
import { clip, titleSize } from "./text";

/**
 * The picture a chat app, a class stream or a social post shows beside a link.
 *
 * Until November 2026 every page shared the same text-only card ("Investing
 * Studio", one sentence, no image), so a link to a bond lesson looked exactly
 * like a link to the homepage. Each card now says what the page is: the
 * course and unit, the lesson's own title and the question it answers.
 *
 * The cards use the site's own type and colours. The fonts are fetched from
 * Google Fonts, cut down to the characters on the card, when the card is
 * drawn; if that fetch fails the card is still drawn, in the image library's
 * built-in sans-serif, rather than failing the page's build.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/*
 * Every card route runs on the edge runtime. The Node build of the image
 * library finds its fallback font through `import.meta.url`, which webpack
 * turns into an invalid path on Windows when the checkout's folder name has a
 * space in it ("Open Portfolio Studio"): every card was a 500 locally. The edge
 * build bundles the font as an asset instead. Next.js reads `runtime` only as a
 * literal in each route file, so each route says `export const runtime = "edge"`
 * itself rather than importing it from here.
 */

const INK = "#1d1d1f";
const INK_2 = "#424245";
const PAPER = "#F5F5F7";
const SURFACE = "#FFFFFF";
const RULE = "#DEDEE3";
const ACCENT = "#0066CC";

type FontSpec = { family: string; weight: 400 | 500 | 600; name: string };

const FONTS: FontSpec[] = [
  { family: "Inter", weight: 400, name: "Inter" },
  { family: "Inter", weight: 600, name: "Inter" },
  { family: "Fraunces", weight: 500, name: "Fraunces" },
];

/** A fetch that gives up after `ms`, written out because not every runtime has `AbortSignal.timeout`. */
async function fetchWithin(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** One weight of one Google font, subset to `text`. Null when it cannot be had. */
async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const sheet = await fetchWithin(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`,
      8_000,
    );
    const css = sheet.ok ? await sheet.text() : "";
    // Asked without a browser's user agent, the stylesheet names a TrueType file,
    // which is a format the image library reads (it cannot read WOFF2).
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const font = await fetchWithin(src, 8_000);
    return font.ok ? await font.arrayBuffer() : null;
  } catch {
    return null;
  }
}

async function fontsFor(text: string) {
  // Every character the card can draw, so a subset never leaves a glyph out.
  const glyphs = `${text}Investing Studio0123456789·—–-,.:;?!'’"“”()&%$#/ `;
  const loaded = await Promise.all(
    FONTS.map(async (spec) => ({ spec, data: await googleFont(spec.family, spec.weight, glyphs) })),
  );
  return loaded
    .filter((entry): entry is { spec: FontSpec; data: ArrayBuffer } => entry.data !== null)
    .map(({ spec, data }) => ({ name: spec.name, data, weight: spec.weight, style: "normal" as const }));
}

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 600, color: INK }}>
      <svg width="34" height="34" viewBox="0 0 26 26" fill="none">
        <path d="M3 19V7M3 19h20M7 15l5-6 4 3 6-7" stroke={ACCENT} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Investing Studio
    </div>
  );
}

export type CardText = {
  /** What kind of page, and where it sits: "Investment Foundations · Mission 4". */
  eyebrow?: string;
  title: string;
  description?: string;
  /** The bottom line: what the reader will do there. */
  footer: string;
};

/** The standard card: brand, where this sits, the title, the question it answers. */
export async function textCard({ eyebrow, title, description, footer }: CardText): Promise<ImageResponse> {
  const body = description ? clip(description, 150) : "";
  const fonts = await fontsFor(`${eyebrow ?? ""}${title}${body}${footer}`);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "60px 72px",
          fontFamily: "Inter",
          color: INK,
        }}
      >
        <Brand />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
          {eyebrow ? <div style={{ fontSize: 26, color: INK_2 }}>{eyebrow}</div> : null}
          <div
            style={{
              marginTop: eyebrow ? 18 : 0,
              fontFamily: "Fraunces",
              fontWeight: 500,
              fontSize: titleSize(title),
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {clip(title, 120)}
          </div>
          {body ? <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.42, color: INK_2 }}>{body}</div> : null}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 22,
            borderTop: `2px solid ${RULE}`,
            fontSize: 24,
            color: INK_2,
          }}
        >
          <span>{footer}</span>
          <span style={{ width: 120, height: 8, borderRadius: 4, background: ACCENT }} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}

/**
 * The daily puzzle's card. It shows the six redacted clue lines and never the
 * company, so posting a puzzle link gives nothing away.
 */
export async function puzzleCard({ number, clueLabels }: { number: number | null; clueLabels: string[] }): Promise<ImageResponse> {
  const heading = number === null ? "Daily company puzzle" : `Daily company puzzle #${number}`;
  const footer = "Six clues from a real annual report";
  const fonts = await fontsFor(`Which company is this?${heading}${footer}${clueLabels.join("")}`);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: PAPER,
          padding: "60px 72px",
          fontFamily: "Inter",
          color: INK,
          gap: 56,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 520 }}>
          <Brand />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 26, color: INK_2 }}>{heading}</div>
            <div style={{ marginTop: 18, fontFamily: "Fraunces", fontWeight: 500, fontSize: 72, lineHeight: 1.06, letterSpacing: "-0.02em" }}>
              Which company is this?
            </div>
          </div>
          <div style={{ fontSize: 24, color: INK_2 }}>{footer}</div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: "34px 36px",
            background: SURFACE,
            border: `2px solid ${RULE}`,
            borderRadius: 18,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: INK_2 }}>
            <span>Annual report</span>
            <span style={{ width: 170, height: 18, borderRadius: 4, background: INK }} />
          </div>
          {clueLabels.map((label, index) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12, borderTop: `1px solid ${RULE}` }}>
              <span style={{ fontSize: 19, color: INK_2 }}>{`${index + 1}. ${label}`}</span>
              <span style={{ width: `${88 - index * 9}%`, height: 14, borderRadius: 4, background: index === 0 ? ACCENT : "#C9C9CF" }} />
            </div>
          ))}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
