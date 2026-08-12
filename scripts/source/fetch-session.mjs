#!/usr/bin/env node
/**
 * Damodaran Investment Philosophies source pipeline.
 *
 * Fetches the primary sources for one or more sessions, extracts readable text,
 * and records provenance so a lesson author can cite exactly what was reviewed.
 *
 *   node scripts/source/fetch-session.mjs 6          one session
 *   node scripts/source/fetch-session.mjs 6-8        inclusive range
 *   node scripts/source/fetch-session.mjs all        all 38
 *
 * Everything lands in .source-cache/ which is gitignored on purpose: the corpus
 * is Damodaran's copyrighted course material and must not be redistributed by
 * committing it. Only original OPS analysis belongs in docs/.
 *
 * Requires: curl, pdftotext (xpdf/poppler), yt-dlp.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  statSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const CACHE = join(ROOT, ".source-cache");
const DIRS = {
  pdf: join(CACHE, "pdf"),
  vtt: join(CACHE, "vtt"),
  text: join(CACHE, "text"),
  provenance: join(CACHE, "provenance"),
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const manifest = JSON.parse(readFileSync(join(HERE, "manifest.json"), "utf8"));

function resolveYtDlp() {
  if (process.env.YTDLP && existsSync(process.env.YTDLP)) return process.env.YTDLP;
  const candidates = [
    "yt-dlp",
    join(
      process.env.LOCALAPPDATA ?? "",
      "Microsoft/WinGet/Packages/yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe/yt-dlp.exe",
    ),
  ];
  for (const c of candidates) {
    try {
      execFileSync(c, ["--version"], { stdio: "ignore" });
      return c;
    } catch {
      /* try next */
    }
  }
  return null;
}

const YTDLP = resolveYtDlp();

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 64,
    ...opts,
  });
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function download(url, dest, reuse = false) {
  if (reuse && existsSync(dest) && statSync(dest).size > 0) {
    return { url, bytes: statSync(dest).size, sha256: sha256(dest), reused: true };
  }
  sh("curl", ["-sL", "--fail", "-A", UA, url, "-o", dest]);
  const size = statSync(dest).size;
  if (size === 0) throw new Error(`empty download: ${url}`);
  return { url, bytes: size, sha256: sha256(dest) };
}

function pdfToText(pdf, txt) {
  sh("pdftotext", ["-layout", pdf, txt]);
  const body = readFileSync(txt, "utf8");
  const pages = (body.match(/\f/g) ?? []).length + 1;
  const { text: repaired, map } = repairDeckText(body);
  writeFileSync(txt, repaired);
  // Honest residual metric: any character still sitting between two lowercase
  // letters that is not a legitimate intra-word character. Counts every deck's
  // encoding, not just one hardcoded character.
  const residual = (repaired.match(/[a-z][^a-z\s'-]{1}[a-z]/g) ?? []).length;
  return {
    pages,
    chars: repaired.length,
    ligatureMap: map,
    residualSuspicious: residual,
  };
}

const LIGATURE_PROBES = {
  ti: [
    "informa#on", "valua#on", "op#on", "ra#o", "es#mat", "ac#ve", "nega#ve",
    "posi#ve", "ques#on", "func#on", "rela#ve", "inves#ng", "tes#ng",
    "dura#on", "equi#es", "correla#on", "sec#on", "expecta#on", "assump#on",
    "propor#on", "prac#ce", "deprecia#on", "condi#on", "defini#on",
    "competi#ve", "competi#on", "prac#oner", "ins#tu#on", "poten#al",
  ],
  tt: [
    "pa#ern", "be#er", "ma#er", "buffe#", "ge#ing", "se#le", "la#er",
    "li#le", "wri#en", "be#ing", "bo#om", "cha#er", "a#ach", "spo#ed",
  ],
  // Probes must be long enough to be unambiguous. "so#" and "le#" were removed
  // because they match ordinary prose ("also.", "sample.", "possible,") when the
  // candidate is a period or comma, which mapped punctuation to a ligature and
  // destroyed real sentence punctuation.
  ft: ["a#er", "shi#", "o#en", "a#ermath", "so#ware", "le#over", "shi#ing", "shi#s"],
  tf: ["por#olio", "por#olios", "pi#alls", "ou#lows"],
  tti: ["se#ng", "ge#ng", "pu#ng", "ne#ng"],
  fi: ["#nancial", "#rst", "bene#t", "#gure", "pro#t", "#nancing"],
  fl: ["#ow", "in#a", "#oat"],
  ffi: ["e#cient", "di#cult"],
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * These decks subset their fonts, so pdftotext emits each ligature as an
 * arbitrary character that DIFFERS PER DECK: "valuation" comes out "valua%on"
 * in session 5, "valua=on" in session 2, "valua8on" in session 4. Hardcoding
 * one mapping only ever fixes one deck, so infer it instead: score every
 * suspicious character against known corrupted spellings and keep the ligature
 * that explains the most of them. A character that explains nothing — a real
 * hyphen in "bid-ask", a real colon in "Session 18:" — scores zero and is left
 * alone. That is what makes this safe to run blind across 38 decks.
 */
/**
 * Build a probe regex that is case-insensitive on the LETTERS but matches the
 * candidate character literally. Lowercasing the body instead would break every
 * uppercase-encoded ligature — "be#er" with char "H" becomes "beHer", which can
 * never match a lowercased "beher". Decks use a different character per
 * ligature type, and the secondary ones are usually uppercase, so this matters.
 */
function probeRegex(probe, char) {
  const body = [...probe]
    .map((ch) => {
      if (ch === "#") return escapeRe(char);
      if (/[a-z]/.test(ch)) return `[${ch}${ch.toUpperCase()}]`;
      return escapeRe(ch);
    })
    .join("");
  return new RegExp(body, "g");
}

function inferLigatureMap(body) {
  const freqs = new Map();
  for (const m of body.match(/[a-z][^a-z\s][a-z]/g) ?? []) {
    freqs.set(m[1], (freqs.get(m[1]) ?? 0) + 1);
  }
  // Word-final ligatures (ShiS, aYer) never appear between two lowercase
  // letters, so count that context too or they stay invisible.
  for (const m of body.match(/[a-z][^a-z\s](?![a-z])/g) ?? []) {
    freqs.set(m[1], (freqs.get(m[1]) ?? 0) + 1);
  }
  const map = {};
  for (const [char, freq] of freqs) {
    if (freq < 2) continue;

    // Period and comma are never used as ligature glyphs by these producers but
    // are extremely common as real punctuation, so a stray probe hit on them is
    // catastrophic: "." once scored as "ft" and the word-final rule turned
    // "returns." into "returnsft", shredding 83 of 110 periods in one deck while
    // the residual metric still read zero. Blocklist exactly those two rather
    // than a frequency heuristic, which wrongly rejected "%" in session 5
    // because "10%" is common.
    if (char === "." || char === ",") continue;

    let best = null;
    let bestScore = 0;
    for (const [lig, probes] of Object.entries(LIGATURE_PROBES)) {
      let score = 0;
      for (const probe of probes) {
        score += (body.match(probeRegex(probe, char)) ?? []).length;
      }
      if (score > bestScore) {
        bestScore = score;
        best = lig;
      }
    }
    if (best && bestScore >= 2) map[char] = best;
  }
  return map;
}

function applyLigatureMap(text, map) {
  let out = text;
  for (const [char, ligature] of Object.entries(map)) {
    const c = escapeRe(char);
    // Between lowercase letters: valua%on -> valuation, PorIolio -> Portfolio.
    // Run twice so adjacent occurrences (insFtuFonal) both resolve.
    out = out.replace(new RegExp(`([a-z])${c}([a-z])`, "g"), `$1${ligature}$2`);
    out = out.replace(new RegExp(`([a-z])${c}([a-z])`, "g"), `$1${ligature}$2`);
    // Word-final after a lowercase letter: ShiS -> Shift, BuffeX -> Buffett.
    // Must NOT fire when a letter follows. "weighted?The" is a layout collision
    // between two columns, not a ligature, and substituting there actively
    // corrupts clean text (it produced "weightedftThe").
    // Never apply the word-final rule to characters that double as sentence
    // punctuation, even if they passed inference: "returns." must not become
    // "returnsft".
    if (!".,;:!?\"')(".includes(char)) {
      out = out.replace(
        new RegExp(`([a-z])${c}(?![A-Za-z])`, "g"),
        `$1${ligature}`,
      );
    }
    // Word-initial only for ligatures that can legitimately open a word.
    if (ligature === "fi" || ligature === "fl" || ligature === "ffi") {
      out = out.replace(new RegExp(`\\b${c}(?=[a-z])`, "g"), ligature);
    }
  }
  return out;
}


/**
 * Character inference cannot resolve everything: one deck reuses the SAME
 * character for different ligatures ("porPolios" = tf, "wriPen" = tt, "aPer" =
 * ft), and some ligatures fall below any sane detection threshold. Repair those
 * by word instead. The wildcard matches exactly one non-letter character, so
 * real words are untouched — "alter" cannot match /a[^a-z\s]er/ because "l"
 * is a letter.
 */
const KNOWN_WORD_FIXES = [
  // The wildcard is ONE non-lowercase, non-space character. Ligature characters
  // are frequently uppercase letters (aIer, aPer, porZolio, maTers), so it must
  // allow uppercase; it must exclude lowercase so real words cannot match —
  // "alter" and "after" both have a lowercase letter in that slot.
  [/\b[Aa][^a-z\s]er\b/g, "after"],
  [/\b[Oo][^a-z\s]en\b/g, "often"],
  [/\b[Pp]or[^a-z\s]olio(s?)\b/g, "portfolio$1"],
  [/\b[Pp]i[^a-z\s]alls\b/g, "pitfalls"],
  [/\b[Oo]u[^a-z\s]lows\b/g, "outflows"],
  [/\b[Aa][^a-z\s]empt(s|ed|ing)?\b/g, "attempt$1"],
  [/\b[Aa][^a-z\s]ribut/g, "attribut"],
  [/\b[Aa][^a-z\s]ract/g, "attract"],
  [/\b[Ll]i[^a-z\s]le\b/g, "little"],
  [/\b[Ww]ri[^a-z\s]en\b/g, "written"],
  [/\b[Mm]a[^a-z\s]er(s|ed|ing)?\b/g, "matter$1"],
  [/\b[Bb]e[^a-z\s]er\b/g, "better"],
  [/\b[Ll]a[^a-z\s]er\b/g, "latter"],
  [/\b[Ss]e[^a-z\s]ng\b/g, "setting"],
  [/\b[Gg]e[^a-z\s]ng\b/g, "getting"],
  [/\b[Pp]u[^a-z\s]ng\b/g, "putting"],
  [/\b[Nn]e[^a-z\s]ng\b/g, "netting"],
  [/\b[Oo]pera[^a-z\s]on(s?)\b/g, "operation$1"],
  [/\b[Vv]ola[^a-z\s]lity\b/g, "volatility"],
  [/\b[Rr]a[^a-z\s]ng(s?)\b/g, "rating$1"],
  [/\b[Cc]ompeti[^a-z\s](ve|on|veness)\b/g, "competiti$1"],
  [/\b[Pp]racti[^a-z\s]oner(s?)\b/g, "practitioner$1"],
  [/\b[Pp]a[^a-z\s]ern(s?)\b/g, "pattern$1"],
  [/\b[Bb]o[^a-z\s]om\b/g, "bottom"],
  [/\b[Cc]ha[^a-z\s]er\b/g, "chatter"],
  [/\b[Aa][^a-z\s]ach(ed|es|ing)?\b/g, "attach$1"],
  [/\b[Ss]hi[^a-z\s](ing|s|ed)\b/g, "shift$1"],
  [/\b[Vv]alua[^a-z\s]on(s?)\b/g, "valuation$1"],
  [/\b[Ee]s[^a-z\s]mat(e|es|ed|ing|ion)\b/g, "estimat$1"],
  [/\b[Rr]ela[^a-z\s]ve(ly)?\b/g, "relative$1"],
  [/\b[Ii]nforma[^a-z\s]on(al)?\b/g, "information$1"],
  [/\b[Oo]p[^a-z\s]on(s?)\b/g, "option$1"],
  [/\b[Ff]unc[^a-z\s]on(s?)\b/g, "function$1"],
  [/\b[Cc]on[^a-z\s]nue(d|s)?\b/g, "continue$1"],
  [/\b[Gg]enera[^a-z\s]ng\b/g, "generating"],
  [/\b[Ii]den[^a-z\s]cal\b/g, "identical"],
  [/\b[Cc]haracteris[^a-z\s]cs?\b/g, "characteristics"],
  [/\b[Pp]reconcep[^a-z\s]ons?\b/g, "preconceptions"],
  // Consecutive ligature characters: "quanFFes" is quan + ti + ti + es. Neither
  // character sits between two lowercase letters, so the contextual rules miss it.
  [/\bquan[^a-z\s]{2}es\b/g, "quantities"],

  // ---------------------------------------------------------------------------
  // Ligatures that landed on a real LOWERCASE letter. No structural rule can see
  // these ("ader" for "after"), and the residual metric is blind to them, so each
  // must be named. Found by taking known target words, blanking the ligature
  // position, and reviewing every single-lowercase-letter match across all 38
  // decks — then checking each candidate IN CONTEXT.
  //
  // Deliberately NOT fixed, because context proved them legitimate English:
  //   "later"  — "detected sooner or later", "cash flows later"   (s11, s16, s20)
  //   "open"   — "Monday open", "The open question"               (s10, s18, s24, s28)
  //   "maker"  — "a dealer or market maker"                       (s6)
  // A blanket pattern would have corrupted all nine of those.
  // ---------------------------------------------------------------------------
  [/\bpor[bfgehp]olio\b/g, "portfolio"],
  [/\bpor[bfgehp]olios\b/g, "portfolios"],
  [/\bo[bdeghmn]en\b/g, "often"],
  [/\ba(?:d|n)er\b/g, "after"],
  [/\baiermath\b/g, "aftermath"],
  [/\bbe(?:o|e|f|g)er\b/g, "better"],
  [/\bbofom\b/g, "bottom"],
  [/\blaaer\b/g, "latter"],
  [/\bafracts\b/g, "attracts"],
  [/\bafention\b/g, "attention"],
  [/\bagempt\b/g, "attempt"],
  [/\bpukng\b/g, "putting"],
  [/\bsikng\b/g, "sitting"],
  [/\bshib\b/g, "shift"],
  [/\bshibs\b/g, "shifts"],
  [/\bnewslefters\b/g, "newsletters"],
  [/\bBuffeg\b/g, "Buffett"],
  [/\bmafer(s)?\b/g, "matter$1"],
  [/\bPorfolio\b/g, "Portfolio"],
  [/\bporcolio(s)?\b/g, "portfolio$1"],
  [/\bPihalls\b/g, "Pitfalls"],
  [/\bdriP\b/g, "drift"],
  [/\bDpping\b/g, "tipping"],
  // Repair of my own earlier over-reach, in case a stale file is reprocessed.
  [/([a-z])ft([A-Z])/g, "$1 $2"],
];

function repairKnownWords(text) {
  let out = text;
  for (const [re, replacement] of KNOWN_WORD_FIXES) {
    out = out.replace(re, (match, ...groups) => {
      const g = typeof groups[0] === "string" ? groups[0] : "";
      let fixed = replacement.replace("$1", g ?? "");
      if (/^[A-Z]/.test(match)) fixed = fixed[0].toUpperCase() + fixed.slice(1);
      return fixed;
    });
  }
  return out;
}

function repairDeckText(body) {
  let out = body
    .replace(/-�-/g, "-")
    .replace(/^[ \t]*�[ \t]/gm, "- ")
    .replace(/�/g, "-")
    ;

  const map = inferLigatureMap(out);
  out = applyLigatureMap(out, map);
  out = repairKnownWords(out);
  // Word-initial "ti" cases the contextual rules cannot see, e.g. time -> Fme.
  for (const char of Object.keys(map).filter((c) => map[c] === "ti")) {
    const c = escapeRe(char);
    // \b cannot match before a symbol (there is no word boundary between a
    // space and ":"), so ":ming" survived. Use an explicit "not preceded by a
    // letter" guard instead.
    const pre = "(?<![A-Za-z])";
    out = out
      .replace(new RegExp(`${pre}${c}me(s|d)?\\b`, "g"), (_m, s) => `time${s ?? ""}`)
      .replace(new RegExp(`${pre}${c}ming\\b`, "g"), "timing")
      .replace(new RegExp(`${pre}${c}de\\b`, "g"), "tide")
      .replace(new RegExp(`${pre}${c}pping\\b`, "g"), "tipping");
  }
  return { text: out, map };
}

/**
 * YouTube ASR VTT repeats each line two or three times as the caption rolls,
 * and carries per-word <c> timing tags. Keep the newest line of every cue and
 * drop consecutive repeats, then group into timestamped paragraphs so a lesson
 * author can cite "narration 13:54".
 */
function cleanVtt(vttPath, outPath) {
  const raw = readFileSync(vttPath, "utf8");
  const blocks = raw.split(/\r?\n\r?\n/);
  const cues = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).filter(Boolean);
    const tsLine = lines.find((l) => l.includes("-->"));
    if (!tsLine) continue;
    const start = tsLine.split("-->")[0].trim().split(".")[0];
    const body = lines
      .filter((l) => !l.includes("-->") && !/^(WEBVTT|Kind:|Language:)/.test(l))
      .map((l) => l.replace(/<[^>]*>/g, "").trim())
      .filter(Boolean);
    if (!body.length) continue;
    cues.push({ start, text: body[body.length - 1] });
  }

  const kept = [];
  for (const cue of cues) {
    if (kept.length && kept[kept.length - 1].text === cue.text) continue;
    kept.push(cue);
  }

  const paragraphs = [];
  let buf = [];
  let stamp = kept[0]?.start ?? "00:00:00";
  for (const cue of kept) {
    buf.push(cue.text);
    if (buf.join(" ").split(/\s+/).length >= 70) {
      paragraphs.push(`[${stamp}] ${buf.join(" ").replace(/\s+/g, " ").trim()}`);
      buf = [];
      stamp = cue.start;
    }
  }
  if (buf.length) {
    paragraphs.push(`[${stamp}] ${buf.join(" ").replace(/\s+/g, " ").trim()}`);
  }

  const out = paragraphs.join("\n\n");
  writeFileSync(outPath, out);
  const words = out.split(/\s+/).length;
  return { cues: cues.length, paragraphs: paragraphs.length, words };
}

/**
 * Upload titles differ from the index wording by punctuation and small edits
 * ("Market Timing - Does it Work?" for "Market Timing: Does it work?"), so
 * compare significant words rather than a literal prefix. A genuinely wrong
 * video — the bond-risk row pointing at "Overview of class" — scores near zero.
 */
function titleOverlap(expected, actual) {
  const words = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((w) => w.length > 3);
  const want = [...new Set(words(expected))];
  if (!want.length) return 1;
  const have = new Set(words(actual));
  return want.filter((w) => have.has(w)).length / want.length;
}

function videoMeta(videoId) {
  try {
    const line = sh(YTDLP, [
      "--skip-download",
      "--no-warnings",
      "--print",
      "%(title)s\t%(duration_string)s",
      `https://www.youtube.com/watch?v=${videoId}`,
    ]).trim();
    const [title, duration] = line.split("\t");
    return { title, duration };
  } catch {
    return { title: null, duration: null };
  }
}

/** Reuse an already-downloaded caption track: re-extraction must not re-hit YouTube. */
function reuseCaptions(session) {
  const found = readdirSync(DIRS.vtt).filter(
    (f) => f.startsWith(`session${session}.`) && f.endsWith(".vtt"),
  );
  if (!found.length) return { status: "no-caption-track", file: null };
  const file = join(DIRS.vtt, found[0]);
  if (statSync(file).size === 0) return { status: "empty-caption-track", file: null };
  return { status: "ok", file };
}

function fetchCaptions(videoId, session) {
  const stem = join(DIRS.vtt, `session${session}`);
  for (const f of readdirSync(DIRS.vtt).filter((f) => f.startsWith(`session${session}.`))) {
    rmSync(join(DIRS.vtt, f));
  }
  try {
    sh(YTDLP, [
      "--write-auto-subs",
      "--sub-lang",
      "en",
      "--sub-format",
      "vtt",
      "--skip-download",
      "--no-warnings",
      "-o",
      `${stem}.%(ext)s`,
      `https://www.youtube.com/watch?v=${videoId}`,
    ]);
  } catch {
    return { status: "fetch-failed", file: null };
  }
  const produced = readdirSync(DIRS.vtt).filter(
    (f) => f.startsWith(`session${session}.`) && f.endsWith(".vtt"),
  );
  if (!produced.length) return { status: "no-caption-track", file: null };
  const file = join(DIRS.vtt, produced[0]);
  if (statSync(file).size === 0) return { status: "empty-caption-track", file: null };
  return { status: "ok", file };
}

function fetchSession(n, reextract = false) {
  const entry = manifest.sessions.find((s) => s.n === n);
  if (!entry) throw new Error(`no manifest entry for session ${n}`);

  const record = {
    session: n,
    expectedTitle: entry.title,
    fetchedAt: new Date().toISOString(),
    slides: null,
    quiz: null,
    video: { id: entry.videoId, note: entry.videoNote ?? null },
    warnings: [],
  };

  // Slides
  const slidesPdf = join(DIRS.pdf, `session${n}.pdf`);
  const slidesTxt = join(DIRS.text, `session${n}-slides.txt`);
  try {
    const dl = download(`${manifest.course.slidesBase}/session${n}.pdf`, slidesPdf, reextract);
    record.slides = { ...dl, ...pdfToText(slidesPdf, slidesTxt), text: slidesTxt };
  } catch (err) {
    record.warnings.push(`slides unavailable: ${err.message}`);
  }

  // Quiz and solutions
  const quizPdf = join(DIRS.pdf, `quiz${n}.pdf`);
  const quizTxt = join(DIRS.text, `session${n}-quiz.txt`);
  try {
    const dl = download(`${manifest.course.quizBase}/quiz${n}.pdf`, quizPdf, reextract);
    record.quiz = { ...dl, ...pdfToText(quizPdf, quizTxt), text: quizTxt };
  } catch (err) {
    record.warnings.push(`quiz unavailable: ${err.message}`);
  }

  // Narration
  if (!YTDLP) {
    record.warnings.push("yt-dlp not found; narration not fetched");
    record.video.captionStatus = "skipped-no-yt-dlp";
  } else {
    const meta = reextract ? { title: null, duration: null } : videoMeta(entry.videoId);
    record.video.actualTitle = meta.title;
    record.video.duration = meta.duration;
    if (meta.title && !entry.videoNote) {
      const overlap = titleOverlap(entry.title, meta.title);
      record.video.titleOverlap = Number(overlap.toFixed(2));
      if (overlap < 0.5) {
        record.warnings.push(
          `video title "${meta.title}" does not match expected "${entry.title}" (keyword overlap ${(overlap * 100).toFixed(0)}%) — verify before citing narration`,
        );
      }
    }
    const cap = reextract ? reuseCaptions(n) : fetchCaptions(entry.videoId, n);
    record.video.captionStatus = cap.status;
    if (cap.status === "ok") {
      const txt = join(DIRS.text, `session${n}-transcript.txt`);
      record.video = { ...record.video, ...cleanVtt(cap.file, txt), transcript: txt };
    } else {
      record.warnings.push(
        `no usable caption track (${cap.status}); narration NOT reviewed for this session`,
      );
    }
  }

  writeFileSync(
    join(DIRS.provenance, `session${n}.json`),
    JSON.stringify(record, null, 2),
  );
  return record;
}

function parseTargets(arg) {
  if (!arg || arg === "all") return manifest.sessions.map((s) => s.n);
  const out = [];
  for (const part of arg.split(",").map((p) => p.trim()).filter(Boolean)) {
    if (/^\d+-\d+$/.test(part)) {
      const [a, b] = part.split("-").map(Number);
      for (let i = a; i <= b; i += 1) out.push(i);
    } else if (/^\d+$/.test(part)) {
      out.push(Number(part));
    } else {
      throw new Error(`unrecognised target "${part}" (use N, N-M, N,M, or all)`);
    }
  }
  return [...new Set(out)];
}

for (const dir of Object.values(DIRS)) mkdirSync(dir, { recursive: true });

const args = process.argv.slice(2);
const reextract = args.includes("--reextract");
const targets = parseTargets(args.find((a) => !a.startsWith("--")));
if (!YTDLP) console.warn("! yt-dlp not found — slides and quizzes only\n");

const summary = [];
for (const n of targets) {
  process.stdout.write(`session ${String(n).padStart(2)} ... `);
  try {
    const r = fetchSession(n, reextract);
    summary.push(r);
    const bits = [
      r.slides ? `slides ${r.slides.pages}p` : "slides MISSING",
      r.quiz ? `quiz ${r.quiz.pages}p` : "quiz MISSING",
      r.video.captionStatus === "ok"
        ? `narration ${r.video.words}w`
        : `narration ${r.video.captionStatus}`,
    ];
    console.log(bits.join(" | ") + (r.warnings.length ? `  (${r.warnings.length} warning)` : ""));
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
  }
}

const withNarration = summary.filter((r) => r.video.captionStatus === "ok").length;
console.log(
  `\n${summary.length} session(s): ${withNarration} with narration, ${summary.length - withNarration} without.`,
);
const warned = summary.filter((r) => r.warnings.length);
if (warned.length) {
  console.log("\nWarnings:");
  for (const r of warned) for (const w of r.warnings) console.log(`  session ${r.session}: ${w}`);
}
console.log(`\nCache: ${CACHE}`);
