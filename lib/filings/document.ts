import { parse, type DefaultTreeAdapterMap } from "parse5";

/**
 * A filing, read as the document its company wrote.
 *
 * The reader used to strip a filing to plain text and then guess where its
 * paragraphs, tables and headings had been. Every guess that missed became a
 * scrap on the page: a lone "$", half a sentence, a page header between two
 * paragraphs, a column of figures without its headings. Fixing guesses one
 * company at a time left the mechanism that made them.
 *
 * This keeps the filing's own structure instead. The HTML is parsed, and the
 * document becomes a sequence of blocks the company itself made: each paragraph
 * as a paragraph, each table as a table with its own rows and cells. Only what
 * serves a printed page is taken away: the styling for paper, hidden XBRL data,
 * page numbers, and the header repeated at the top of every page. What is shown
 * is rebuilt from an allow-list of elements (bold, italic, superscript, line
 * breaks, table cells with their spans and alignment), so nothing the filing
 * contains can run as code or restyle the site.
 *
 * Each block also has a plain text, and the document's text is those texts one
 * to a line. Section finding, search, kept passages and the Competitors and
 * Input costs tabs all read that text, and an offset in it always falls inside
 * a block the reader can draw, which is what lets a search hit or a kept
 * passage be marked in the filing's own paragraph.
 */

type Node = DefaultTreeAdapterMap["childNode"];
type Element = DefaultTreeAdapterMap["element"];
type Parent = DefaultTreeAdapterMap["parentNode"];

/**
 * A paragraph, a heading or a list item. Blocks are plain data: the parsed
 * filing is let go once they are read, since for a 13 MB report such as
 * JPMorgan's it takes some 280 MB, and a report is read once and then paged.
 */
export type TextBlock = {
  kind: "text";
  /** The paragraph as the reader draws it, rebuilt from the allow-list, one character for each of `text`. */
  html: string;
  align: "center" | "right" | null;
  bullet: boolean;
  /**
   * One printed line, placed on the page by its position: Deckers' reports are
   * set this way, a box to each line, so a paragraph arrives as a stack of lines.
   */
  line: boolean;
  text: string;
  /** Share of the text set in bold, which marks a heading. */
  bold: number;
  /**
   * Printed for a page rather than the reader: a page number, "Table of
   * Contents". It stays in the text, where a page number after a contents entry
   * is what tells the entry from a heading, and is never drawn.
   */
  furniture: boolean;
  start: number;
  end: number;
};

export type TableBlock = {
  kind: "table";
  /** Each row as the reader draws it, `<tr>` and all. */
  rowHtml: string[];
  /** Where, in each row's text, a space between cells falls that the table draws as its layout. */
  rowVirtuals: number[][];
  /** Where each row starts in the block's text, which puts one row on each line. */
  rowStarts: number[];
  /** How many characters each row's first cell has, which is what wraps. */
  labelLengths: number[];
  /** Rows above the first figure, repeated on a page that continues the table. */
  headerRows: number;
  text: string;
  start: number;
  end: number;
};

export type DocumentBlock = TextBlock | TableBlock;

export type FilingDocument = {
  blocks: DocumentBlock[];
  /** The blocks' texts, one to a line. */
  text: string;
};

/** Elements that start a new block. Anything else is inline and is unwrapped to its content. */
const BLOCK = new Set([
  "address", "article", "aside", "blockquote", "body", "center", "dd", "div", "dl", "dt", "footer", "form",
  "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "html", "li", "main", "nav", "ol", "p", "pre", "section", "ul",
]);
/** Elements whose content is never shown: not text, or the XBRL data a filing carries out of sight. */
const DROP = new Set([
  "head", "script", "style", "title", "meta", "link", "img", "svg", "object", "embed", "iframe", "noscript",
  "template", "ix:header", "xbrli:context", "xbrli:unit",
]);

const attr = (node: Element, name: string) => node.attrs.find((item) => item.name === name)?.value;

/**
 * What has been worked out about an element, kept on the element itself. A
 * filing has millions of elements, and held in WeakMaps instead these made
 * garbage collection a sixth of the time taken to read one.
 */
type Noted = Element & { opsStyle?: Readonly<Record<string, string>>; opsHasBlock?: boolean; opsText?: string };

const NO_STYLE: Readonly<Record<string, string>> = Object.freeze({});

/**
 * The only properties the reader looks at. Filers' style attributes make up
 * much of a filing's size, so only these are picked out, not every declaration.
 */
const WANTED_STYLE =
  /(?:^|;)\s*(display|font-weight|font-style|vertical-align|padding-left|padding-right|margin-left|margin-right|text-align|text-indent|top|border-bottom|border-top)\s*:\s*([^;]*)/gi;

function styleOf(node: Noted): Readonly<Record<string, string>> {
  if (node.opsStyle) return node.opsStyle;
  const raw = attr(node, "style");
  let style = NO_STYLE;
  if (raw) {
    const own: Record<string, string> = {};
    for (const [, name, value] of raw.matchAll(WANTED_STYLE)) own[name.toLowerCase()] = value.trim().toLowerCase();
    style = own;
  }
  node.opsStyle = style;
  return style;
}

const isElement = (node: Node): node is Element => "tagName" in node && typeof (node as Element).tagName === "string";
const hidden = (node: Element) => styleOf(node).display === "none" || attr(node, "hidden") !== undefined;
/**
 * Whether an element starts a block. A <div> set `display: inline` does not:
 * Microsoft and Oracle set each bullet's text in one, beside the bullet.
 */
const isBlock = (node: Element) => BLOCK.has(node.tagName) && !/^inline/.test(styleOf(node).display ?? "");
/** An element whose children are laid out as boxes side by side, so their words never run together. */
const laysOutBoxes = (node: Element) => /^(inline-)?(flex|grid)$/.test(styleOf(node).display ?? "");

/** Characters the text holds in a plainer form, one for one, so search finds "company's" and "cost-of-sales". */
const PLAIN: Record<string, string> = {
  "‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-", "−": "-",
};
/**
 * Printing instructions rather than characters: a soft hyphen, zero-width
 * spaces and joiners. (A byte-order mark is whitespace to JavaScript, so it
 * becomes a space.)
 */
const INVISIBLE = /[\u00ad\u200b\u200c\u200d]/;
const ENTITY: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (character) => ENTITY[character]);
const toPlain = (value: string) => value.replace(/[‘’“”–—−]/g, (character) => PLAIN[character]);
/** A text node in pieces: a run of whitespace, a run of printing marks, or a word. */
const PIECES = /\s+|[\u00ad\u200b\u200c\u200d]+|[^\s\u00ad\u200b\u200c\u200d]+/g;

/**
 * Text and HTML written side by side, one character of text for each character
 * shown, so an offset in the text is a place in what is drawn. The one
 * exception is the space between a table's cells, which the table draws as its
 * layout: its place is kept in `virtuals`.
 *
 * Text is written a word at a time and its last character kept aside: asking a
 * string still being built what it ends with makes V8 copy it, and written a
 * character at a time, JPMorgan's annual report took twice as long to read.
 */
class Writer {
  text = "";
  html = "";
  /** Where each character drawn by the layout rather than by a character sits in the text. */
  readonly virtuals: number[] = [];
  boldChars = 0;
  /** The last character of the text, kept so it is never read back from the string being built. */
  private last = "";
  private glued = false;

  get length() {
    return this.text.length;
  }

  /** Words, their text and HTML one character for each, the HTML's entities counting as one. */
  chunk(text: string, html: string, bold: boolean) {
    this.text += text;
    this.html += html;
    this.last = text[text.length - 1];
    this.glued = false;
    if (bold) this.boldChars += text.length;
  }

  /** One space, however many the source had, and none at the start of a line. */
  space() {
    if (this.glued || !this.last || this.last === " " || this.last === "\n") return;
    this.chunk(" ", " ", false);
  }

  /** Markup with no text of its own. */
  tag(html: string) {
    this.html += html;
  }

  /** A space between a table's cells, which the table draws as its layout. */
  virtual(textChar: string) {
    this.virtuals.push(this.text.length);
    this.text += textChar;
    this.last = textChar;
  }

  /**
   * Take back a space just written, from the text and the HTML alike, leaving
   * any markup written after it. A space the layout draws is left alone.
   */
  private dropSpace(): boolean {
    if (this.last !== " " || this.virtuals[this.virtuals.length - 1] === this.text.length - 1) return false;
    const html = this.html.replace(/ ((?:<[^>]*>)*)$/, "$1");
    if (html === this.html) return false;
    this.html = html;
    this.text = this.text.slice(0, -1);
    this.last = this.text[this.text.length - 1] ?? "";
    return true;
  }

  /** No space before the next character, as when "$" and its figure sit in two cells. */
  glue() {
    this.glued = true;
    this.dropSpace();
  }

  trimEnd() {
    while (this.dropSpace());
  }

  finish() {
    this.trimEnd();
  }
}

type Mark = { from: number; to: number };

/**
 * HTML written by a Writer, with a stretch of its text marked. Tags hold no
 * text and an entity is one character, so counting what is left finds each
 * offset; the characters the layout draws are skipped at their recorded places.
 * A mark closes around every tag, so the HTML stays well formed.
 */
function withMark(html: string, mark: Mark, virtuals: readonly number[] = []): string {
  if (mark.to <= mark.from) return html;
  const out: string[] = [];
  let position = 0;
  let next = 0;
  let open = false;
  let at = 0;
  while (at < html.length) {
    if (html[at] === "<") {
      const close = html.indexOf(">", at) + 1;
      if (open) out.push("</mark>");
      open = false;
      out.push(html.slice(at, close));
      at = close;
      continue;
    }
    while (next < virtuals.length && virtuals[next] === position) {
      position += 1;
      next += 1;
    }
    const end = html[at] === "&" ? html.indexOf(";", at) + 1 : at + 1;
    const inside = position >= mark.from && position < mark.to;
    if (inside !== open) out.push(inside ? "<mark>" : "</mark>");
    open = inside;
    out.push(html.slice(at, end));
    position += 1;
    at = end;
  }
  if (open) out.push("</mark>");
  return out.join("");
}

type Context = { bold: boolean };

function writeInline(node: Node, writer: Writer, context: Context) {
  if (node.nodeName === "#text") {
    for (const [piece] of (node as DefaultTreeAdapterMap["textNode"]).value.matchAll(PIECES)) {
      if (/^\s/.test(piece)) writer.space();
      else if (!INVISIBLE.test(piece[0])) writer.chunk(toPlain(piece), escapeHtml(piece), context.bold);
    }
    return;
  }
  if (!isElement(node) || DROP.has(node.tagName) || hidden(node)) return;
  if (node.tagName === "br") {
    writer.space();
    writer.tag("<br>");
    return;
  }
  const style = styleOf(node);
  const bold = node.tagName === "b" || node.tagName === "strong" || /^(bold|bolder|[6-9]00)$/.test(style["font-weight"] ?? "");
  const italic = node.tagName === "i" || node.tagName === "em" || style["font-style"] === "italic";
  const superscript = node.tagName === "sup" || style["vertical-align"] === "super";
  const subscript = node.tagName === "sub" || style["vertical-align"] === "sub";
  const wrappers = [bold && "strong", italic && "em", superscript && "sup", subscript && "sub"].filter(Boolean) as string[];
  // Filers space words apart with padding rather than a space: Netflix writes
  // "Item 1." and "Legal Proceedings" as two spans, the second padded 24pt.
  const gap = (value: string | undefined) => Boolean(value && /^[\d.]+/.test(value) && Number.parseFloat(value) > 0);
  if (gap(style["padding-left"]) || gap(style["margin-left"])) writer.space();
  for (const wrapper of wrappers) writer.tag(`<${wrapper}>`);
  const inner = { bold: context.bold || bold };
  const boxes = laysOutBoxes(node);
  for (const child of node.childNodes) {
    // A block inside inline content, as in a table cell holding several <div>s,
    // is a space apart, as is each box of a flex layout: a bullet and its text.
    if (isElement(child) && (boxes || isBlock(child))) {
      writer.space();
      writeInline(child, writer, inner);
      writer.space();
    } else {
      writeInline(child, writer, inner);
    }
  }
  for (const wrapper of [...wrappers].reverse()) writer.tag(`</${wrapper}>`);
  if (gap(style["padding-right"]) || gap(style["margin-right"])) writer.space();
}

/** Whether an element holds block-level content, so it is a container rather than a paragraph. */
function hasBlockChild(node: Noted): boolean {
  if (node.opsHasBlock !== undefined) return node.opsHasBlock;
  node.opsHasBlock = node.childNodes.some(
    (child) => isElement(child) && !DROP.has(child.tagName) && !hidden(child) && (isBlock(child) || child.tagName === "table" || hasBlockChild(child)),
  );
  return node.opsHasBlock;
}

/** A paragraph before it is written: runs of inline content, more than one when a sentence broken by a printed page is joined. */
type RawText = Pick<TextBlock, "kind" | "align" | "bullet" | "line"> & { runs: Node[][] };
type RawBlock = RawText | { kind: "table"; node: Element };
/** A block as it is read, still holding the markup a joined sentence is rewritten from. */
type ReadBlock = (TextBlock & { runs: Node[][] }) | TableBlock;

function alignOf(node: Element): TextBlock["align"] {
  const value = styleOf(node)["text-align"] ?? attr(node, "align")?.toLowerCase();
  return value === "center" || value === "right" ? value : null;
}

/** A bullet or a list number: "•", "3.", "(a)", "(ii)". */
const MARKER = /^([•·●◦▪■○➢➤►▶✓✔*\-–—]|\(?\d{1,2}[.)]|\(?[a-z][.)]|\(\d{1,2}\)|\([a-z]{1,4}\)|[ivx]{1,5}[.)])$/i;

/** A node's text if it is no longer than `limit`, without writing it out; otherwise null. */
function shortText(node: Node, limit = 8): string | null {
  let text = "";
  const walk = (current: Node): boolean => {
    if (current.nodeName === "#text") {
      text += (current as DefaultTreeAdapterMap["textNode"]).value;
      return text.trim().length <= limit;
    }
    if (!isElement(current) || DROP.has(current.tagName) || hidden(current)) return true;
    return current.childNodes.every(walk);
  };
  return walk(node) ? text.trim() : null;
}

/**
 * A list item built as two boxes, its marker and its text, such as a bullet in
 * a <div> beside a <div>. Read apart, the bullet was a paragraph of its own
 * above every item. The pair is only taken where the two are all their parent
 * holds, so a page number between two paragraphs is never read as the next
 * paragraph's number.
 */
function markerPair(parent: Parent): { marker: Node; content: Element } | null {
  const children = parent.childNodes.filter((child) =>
    child.nodeName === "#text" ? (child as DefaultTreeAdapterMap["textNode"]).value.trim() !== "" : isElement(child) && !DROP.has(child.tagName) && !hidden(child));
  if (children.length !== 2 || !isElement(children[1]) || children[1].tagName === "table") return null;
  const marker = shortText(children[0]);
  return marker && MARKER.test(marker) ? { marker: children[0], content: children[1] } : null;
}

/** The document's blocks, in order: paragraphs where the markup has paragraphs, tables where it has tables. */
function collect(parent: Parent, out: RawBlock[], align: TextBlock["align"] = null) {
  const pair = markerPair(parent);
  if (pair) {
    const start = out.length;
    if (hasBlockChild(pair.content)) collect(pair.content, out, alignOf(pair.content) ?? align);
    else out.push({ kind: "text", runs: [[pair.content]], align: alignOf(pair.content) ?? align, bullet: false, line: false });
    const first = out[start];
    if (first?.kind === "text") first.runs = [[pair.marker], ...first.runs];
    else out.splice(start, 0, { kind: "text", runs: [[pair.marker]], align, bullet: false, line: false });
    return;
  }
  let run: Node[] = [];
  const flush = () => {
    if (run.length) out.push({ kind: "text", runs: [run], align, bullet: false, line: false });
    run = [];
  };
  for (const child of parent.childNodes) {
    if (!isElement(child)) {
      if (child.nodeName === "#text") run.push(child);
      continue;
    }
    if (DROP.has(child.tagName) || hidden(child)) continue;
    if (child.tagName === "table") {
      flush();
      const rows = tableRows(child);
      if (isFigureTable(rows)) out.push({ kind: "table", node: child });
      else for (const cells of rows) collectRow(cells, out, align);
    } else if (child.tagName === "hr") {
      flush();
    } else if (isBlock(child) || hasBlockChild(child)) {
      flush();
      const own = alignOf(child) ?? align;
      // A paragraph is written from its own element, so bold or italic set on it is kept.
      if (hasBlockChild(child)) collect(child, out, own);
      else out.push({ kind: "text", runs: [[child]], align: own, bullet: child.tagName === "li", line: styleOf(child).top !== undefined });
    } else {
      run.push(child);
    }
  }
  flush();
}

/** Every row of a table, nested sections included, with its cells. */
function tableRows(table: Element): Element[][] {
  const rows: Element[][] = [];
  const walk = (node: Element) => {
    for (const child of node.childNodes) {
      if (!isElement(child) || child.tagName === "table") continue;
      if (child.tagName === "tr") rows.push(child.childNodes.filter((cell): cell is Element => isElement(cell) && (cell.tagName === "td" || cell.tagName === "th")));
      else walk(child);
    }
  };
  walk(table);
  return rows;
}

/** A figure with a thousands separator or decimals: what ends a table's headings. */
const AMOUNT = /\d{1,3}(,\d{3})+|\d\.\d/;
/** Longest a table's headings run, all rows together, before they are a caption instead. */
const HEADINGS_MAX = 400;

/** A cell's text, written once and remembered, since a table is read more than once. */
function cellText(cell: Noted): string {
  let text = cell.opsText;
  if (text === undefined) {
    const probe = new Writer();
    writeInline(cell, probe, { bold: false });
    probe.finish();
    text = probe.text;
    cell.opsText = text;
  }
  return text;
}

/** A figure: an amount, a percentage, a bracketed negative, or a dash standing for nil. */
const FIGURE = /^[$€£¥(]*-?[\d,]*\.?\d+\)?%?$|^-$/;
/** Longer than this and a cell is a paragraph laid out in a table, not a figure or a label. */
const CELL_MAX = 300;

const holdsTable = (node: Element): boolean =>
  node.childNodes.some((child) => isElement(child) && (child.tagName === "table" || holdsTable(child)));

/**
 * Whether a table holds figures, and so is drawn as a table. Filers also use
 * tables to lay out bullets, headings and paragraphs: a column of bullets beside
 * the text, "Item 1A." in one cell and "Risk Factors" in the next, a whole page
 * inside one cell. Those read as text. A table of figures has two rows, a
 * figure after some row's first cell, no table inside it, and at most one cell
 * long enough to be a paragraph for every eight figures, since one long footnote
 * under Exxon's segment table does not make that table a paragraph.
 */
function isFigureTable(rows: Element[][]): boolean {
  const filled = rows.map((cells) => cells.filter((cell) => cellText(cell))).filter((cells) => cells.length);
  if (filled.length < 2 || rows.some((cells) => cells.some(holdsTable))) return false;
  let figures = 0;
  let long = 0;
  for (const cells of filled) {
    cells.forEach((cell, index) => {
      const text = cellText(cell);
      if (index > 0 && FIGURE.test(text.replace(/\s+/g, ""))) figures += 1;
      if (text.length > CELL_MAX) long += 1;
    });
  }
  return figures > 0 && figures >= long * 8;
}

/**
 * A row of a table that is not a table of figures. A row whose cells each hold
 * a line, such as a bullet and its text, is one paragraph. Where a cell holds
 * paragraphs of its own, or a table, each of them is a block.
 */
function collectRow(cells: Element[], out: RawBlock[], align: TextBlock["align"]) {
  const inners = cells.map((cell) => {
    const inner: RawBlock[] = [];
    collect(cell, inner, alignOf(cell) ?? align);
    return inner;
  });
  if (inners.some((inner) => inner.length > 1 || inner.some((block) => block.kind === "table"))) {
    for (const inner of inners) out.push(...inner);
    return;
  }
  const filled = cells.filter((cell) => cellText(cell));
  if (filled.length) out.push({ kind: "text", runs: filled.map((cell) => [cell]), align, bullet: false, line: false });
}

function cellPadding(cell: Element): number {
  const px = (value: string | undefined) => {
    const match = value?.match(/^(-?[\d.]+)(px|pt|em|in)?$/);
    if (!match) return 0;
    const unit = match[2] ?? "px";
    return Number(match[1]) * (unit === "pt" ? 4 / 3 : unit === "em" ? 16 : unit === "in" ? 96 : 1);
  };
  let node: Element | undefined = cell;
  let total = 0;
  // Statement lines are indented by padding on the cell or on the block inside it.
  for (let depth = 0; node && depth < 3; depth += 1) {
    const style = styleOf(node);
    total += px(style["padding-left"]) + px(style["margin-left"]) + Math.max(0, px(style["text-indent"]));
    node = node.childNodes.find(isElement);
  }
  return Math.max(0, Math.min(48, Math.round(total)));
}

/**
 * Cells a figure is split across: filers set "$" in a cell of its own, and the
 * ")" of a negative or the "%" after it in another. In the text they are one
 * figure, "$11.1" and "(2.2)", as a person would type them into search.
 */
const OPENS_FIGURE = /^[$€£¥(]$/;
const CLOSES_FIGURE = /^(\)|%|\)%|%\))$/;

/** One row of a table, its cells a space apart in the text. */
function writeRow(cells: Element[], target: Writer) {
  target.tag("<tr>");
  let written = false;
  let previous = "";
  for (const cell of cells) {
    const style = styleOf(cell);
    const span = Number.parseInt(attr(cell, "colspan") ?? "1", 10) || 1;
    const down = Number.parseInt(attr(cell, "rowspan") ?? "1", 10) || 1;
    const alignment = style["text-align"] ?? attr(cell, "align")?.toLowerCase();
    const classes = [
      /(solid|double)/.test(style["border-bottom"] ?? "") ? (/double/.test(style["border-bottom"] ?? "") ? "rule-double" : "rule") : "",
      /(solid)/.test(style["border-top"] ?? "") ? "rule-top" : "",
    ].filter(Boolean);
    const padding = cellPadding(cell);
    const css = [
      alignment === "center" || alignment === "right" ? `text-align:${alignment}` : "",
      padding ? `padding-left:${padding + 6}px` : "",
    ].filter(Boolean);
    target.tag(`<td${span > 1 ? ` colspan="${span}"` : ""}${down > 1 ? ` rowspan="${down}"` : ""}${classes.length ? ` class="${classes.join(" ")}"` : ""}${css.length ? ` style="${css.join(";")}"` : ""}>`);
    const text = cellText(cell);
    if (text) {
      if (written) {
        if (OPENS_FIGURE.test(previous) || CLOSES_FIGURE.test(text)) target.glue();
        else target.virtual(" ");
      }
      const before = target.length;
      writeInline(cell, target, { bold: false });
      target.trimEnd();
      written = target.length > before || written;
      previous = text;
    }
    target.tag("</td>");
  }
  target.tag("</tr>");
}

function measureTable(node: Element): TableBlock | null {
  const texts: string[] = [];
  const rowHtml: string[] = [];
  const rowVirtuals: number[][] = [];
  const labels: number[] = [];
  for (const cells of tableRows(node)) {
    const writer = new Writer();
    writeRow(cells, writer);
    writer.finish();
    if (!writer.length) continue;
    texts.push(writer.text);
    rowHtml.push(writer.html);
    rowVirtuals.push(writer.virtuals);
    labels.push((cells.map(cellText).find(Boolean) ?? "").length);
  }
  if (!texts.length) return null;
  const rowStarts: number[] = [];
  let at = 0;
  for (const text of texts) {
    rowStarts.push(at);
    at += text.length + 1;
  }
  // Headings are the rows above the first figure, repeated on a page that
  // continues the table; rows long enough to be a caption are not repeated,
  // or a page could hold them and little else.
  let firstFigures = texts.findIndex((text) => AMOUNT.test(text));
  if (texts.slice(0, Math.max(0, firstFigures)).join(" ").length > HEADINGS_MAX) firstFigures = 0;
  return {
    kind: "table",
    rowHtml,
    rowVirtuals,
    rowStarts,
    labelLengths: labels,
    headerRows: firstFigures > 0 && firstFigures <= 4 ? firstFigures : 0,
    text: texts.join("\n"),
    start: 0,
    end: 0,
  };
}

function writeText(block: Pick<RawText, "runs" | "bullet">, writer: Writer) {
  if (block.bullet) {
    writer.chunk("• ", "• ", false);
  }
  const cellOf = (run: Node[]) => {
    const node = run.length === 1 ? run[0] : null;
    return node && isElement(node) && (node.tagName === "td" || node.tagName === "th") ? node : null;
  };
  block.runs.forEach((run, index) => {
    if (index) {
      // A row read as a line: "$" and "11.1" in two cells are one figure.
      const before = cellOf(block.runs[index - 1]);
      const here = cellOf(run);
      if (before && here && (OPENS_FIGURE.test(cellText(before)) || CLOSES_FIGURE.test(cellText(here)))) writer.glue();
      else writer.space();
    }
    for (const node of run) writeInline(node, writer, { bold: false });
  });
}

function measureText(raw: RawText): ReadBlock | null {
  const writer = new Writer();
  writeText(raw, writer);
  writer.finish();
  if (!writer.length) return null;
  const text = writer.text;
  return {
    ...raw,
    html: writer.html,
    text,
    bold: writer.boldChars / Math.max(1, text.replace(/\s/g, "").length),
    furniture: isPageFurniture(text),
    start: 0,
    end: 0,
  };
}

/**
 * What a printed page puts at its foot rather than in its text: a bare page
 * number, as "23", "4." (Alphabet), "F-12" or "F- 1" (Crocs), "Page 7" or
 * "- 7 -"; the "Table of Contents" link back, a rule of dashes, a bare "Item 7"
 * at a page top, and footers such as Apple's "Apple Inc. | Q3 2026 Form 10-Q | 23".
 */
const PAGE_FURNITURE = /^(\d{1,3}\.?|[a-z]-\s?\d{1,3}|page\s+\d{1,3}(\s+of\s+\d{1,3})?|-\s*\d{1,3}\s*-|(\d{1,3}\s+)?table of contents(\s+\d{1,3})?|[-_=*.\s]{3,}|item\s*\d{1,2}[a-c]?(\s*,\s*\d{1,2}[a-c]?)*|.{0,60}\|\s*(q[1-4]\s+)?\d{4}\s+form\s+(10-k|10-q)\s*\|\s*\d{1,3}|\d{1,3}\s*\|?\s*.{0,40}\b(20\d\d\s+)?form\s+10-[kq]|.{0,40}\b20\d\d\s+form\s+10-[kq]\s*\|?\s*\d{1,3})$/i;

export function isPageFurniture(line: string): boolean {
  return PAGE_FURNITURE.test(line.trim());
}

/** A company's name as a page header prints it: "Alphabet Inc.", "THE COCA-COLA COMPANY AND SUBSIDIARIES". */
const COMPANY_NAME_LINE =
  /^[A-Za-z0-9][\w&.,'’ -]{0,60}\b(inc|incorporated|corporation|corp|company|co|ltd|limited|plc|llc|l\.?p|n\.?v|s\.?a|ag|se|holdings|group)\.?(\s+and\s+(its\s+)?(consolidated\s+)?subsidiaries)?$/i;
/** The Part and Item a page belongs to, printed at its top, as Mastercard heads every page. */
const PAGE_ITEM_LINE = /^(part\s+[ivx]+|item\s*\d{1,2}[a-c]?\s*[.:\-–—]?\s*[a-z][^\n]{0,90})$/i;
/** How often a line must repeat to be a running header rather than a heading. */
const RUNNING_HEADER_MIN = 5;
/** A line that ends where a contents entry or a cross-reference index gives its pages. */
export const ENDS_IN_PAGES = /(^|\s)(pages?\s+)?\d{1,4}(\s*[-–]\s*\d{1,4}|\s*,\s+\d{1,4}|\s+,\s*\d{1,4})*$|not applicable\s*(\([a-z]\))?$/i;

/** A line that finishes a sentence, a clause or a heading. */
const ENDS_SENTENCE = /[.:;!?)\]"']$/;
/** Shorter than this and a line without a full stop is a heading, not half a sentence. */
const SENTENCE_LINE_MIN = 60;

/**
 * The company's name and the Part and Item printed at the top of every page.
 * A repeated Item keeps its first appearance only when the document has no other
 * heading for that Item, since it may then be where the section starts.
 */
function withoutRunningHeaders(blocks: ReadBlock[]): ReadBlock[] {
  const counts = new Map<string, number>();
  for (const block of blocks) {
    if (block.kind === "text" && (COMPANY_NAME_LINE.test(block.text) || PAGE_ITEM_LINE.test(block.text))) {
      counts.set(block.text, (counts.get(block.text) ?? 0) + 1);
    }
  }
  const headers = new Set([...counts].filter(([, count]) => count >= RUNNING_HEADER_MIN).map(([line]) => line));
  if (!headers.size) return blocks;
  const itemOf = (line: string) => line.match(/^item\s*(\d{1,2}[a-c]?)/i)?.[1].toLowerCase();
  const seen = new Set<string>();
  return blocks.filter((block) => {
    if (block.kind !== "text" || !headers.has(block.text)) return true;
    const item = itemOf(block.text);
    const otherHeading = item !== undefined && blocks.some((other) =>
      other.kind === "text" && other.text !== block.text && itemOf(other.text) === item && !ENDS_IN_PAGES.test(other.text) && !headers.has(other.text));
    const keep = item !== undefined && !otherHeading && !seen.has(block.text);
    seen.add(block.text);
    return keep;
  });
}

/**
 * A sentence the printed page broke in two, put back into one paragraph.
 * Where a page ended mid-sentence the markup closes the block and opens another
 * after the page's footer, so Coca-Cola's "…to produce finished" and "beverages.
 * The finished beverages are…" were two passages. The footer between them
 * follows the joined paragraph.
 */
function continues(previous: TextBlock, next: TextBlock): boolean {
  if (ENDS_SENTENCE.test(previous.text)) return false;
  // Printed lines placed one by one: a line that does not finish a sentence runs
  // on into the next, whatever letter that starts with ("…this Annual" and
  // "Report."), unless the next starts a bullet or the type changes between
  // them, as from a bold heading to its text. Deckers sets each risk as a bold
  // sentence over several lines, so bold runs on into bold, but only from a
  // full line: a short bold line is a heading of its own.
  if (previous.line && next.line) {
    const bold = previous.bold >= 0.9;
    if (bold !== next.bold >= 0.9 || (bold && previous.text.length < SENTENCE_LINE_MIN)) return false;
    return !MARKER.test(next.text.split(/\s/)[0]) && !/^[•·●◦▪■○]/.test(next.text);
  }
  return previous.text.length >= SENTENCE_LINE_MIN && /^[a-z]/.test(next.text);
}

function withSentencesJoined(blocks: ReadBlock[]): ReadBlock[] {
  const out: ReadBlock[] = [];
  for (const block of blocks) {
    let at = out.length - 1;
    while (at >= 0 && out[at].kind === "text" && (out[at] as TextBlock).furniture) at -= 1;
    const previous = out[at];
    if (block.kind === "text" && !block.furniture && previous?.kind === "text" && continues(previous, block)) {
      const joined = measureText({ kind: "text", runs: [...previous.runs, ...block.runs], align: previous.align, bullet: previous.bullet, line: previous.line });
      if (joined) {
        out[at] = joined;
        continue;
      }
    }
    out.push(block);
  }
  return out;
}

export function readDocument(html: string): FilingDocument {
  const raw: RawBlock[] = [];
  collect(parse(html), raw);
  const measured = raw
    .map((block) => (block.kind === "table" ? measureTable(block.node) : measureText(block)))
    .filter((block): block is ReadBlock => block !== null);
  // What is kept is plain data, so the parsed filing can be let go.
  const blocks: DocumentBlock[] = withSentencesJoined(withoutRunningHeaders(measured)).map((block) => {
    if (block.kind === "table") return block;
    const { runs: _runs, ...text } = block;
    return text;
  });
  let at = 0;
  for (const block of blocks) {
    block.start = at;
    block.end = at + block.text.length;
    at = block.end + 1;
  }
  return { blocks, text: blocks.map((block) => block.text).join("\n") };
}

/**
 * A paragraph as HTML, with a stretch of it marked. `slot` is placed inside the
 * paragraph's last word, held on one line with it, for the Keep button.
 */
export function renderText(block: TextBlock, mark: Mark | null = null, slot = ""): string {
  const drawn = mark ? withMark(block.html, mark) : block.html;
  if (!slot) return drawn;
  // The Keep button rides on the last word, so it never waits on a line of its own.
  // Closing tags after the word stay outside the span that holds them together.
  const html = drawn.replace(/\s+$/, "");
  const closers = html.match(/(<\/[a-z]+>)+$/)?.[0] ?? "";
  const body = html.slice(0, html.length - closers.length);
  const lastSpace = body.lastIndexOf(" ");
  const word = body.slice(lastSpace + 1);
  if (lastSpace === -1 || word.length > 60 || word.includes("<")) return `${html}${slot}`;
  return `${body.slice(0, lastSpace + 1)}<span class="nowrap">${word}${slot}</span>${closers}`;
}

/**
 * Some of a table's rows as table-row HTML, with a stretch of the table's text
 * marked. A page that opens part of the way down the table repeats its
 * headings first, and those hold no text of their own on that page.
 */
export function renderTableRows(block: TableBlock, from: number, to: number, mark: Mark | null = null): string {
  const out = from > 0 ? block.rowHtml.slice(0, Math.min(block.headerRows, from)) : [];
  for (let row = from; row < to; row += 1) {
    const start = block.rowStarts[row];
    out.push(mark ? withMark(block.rowHtml[row], { from: mark.from - start, to: mark.to - start }, block.rowVirtuals[row]) : block.rowHtml[row]);
  }
  return out.join("");
}
