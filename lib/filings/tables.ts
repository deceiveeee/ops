/**
 * A table in a filing, kept as a table.
 *
 * Until this existed the reader turned every table row into a line of text,
 * and any heading cell holding its own block of markup into several. Netflix's
 * buyback table for the quarter to 30 June 2026 arrived as "Period", then
 * "Average Price Paid per Share (2)", then "(in thousands)", then
 * "April 1 - 30, 2026 16,922,312 $ 97.47 16,922,312 $ 30,126,783", each with its
 * own Keep button: numbers with nothing to say which heading they belong to.
 *
 * EDGAR tables are laid out for print. A value sits in one cell and its dollar
 * sign in the cell before it; empty cells space the columns; a heading such as
 * "Three Months Ended" spans the two year columns under it. This works out the
 * columns a reader would see, which are not the columns in the markup:
 *
 * - **A column starts where a value starts.** In the rows below the headings,
 *   every cell that holds a value starts a column. A lone "$" does not: Netflix
 *   puts the dollar sign of its revenue in the cell before the figure and leaves
 *   that cell empty on every other row, so counting it made two columns of one.
 * - **A dollar sign belongs to the value after it, a closing bracket or percent
 *   sign to the value before it.**
 * - **A heading covers the columns that start under it**, so "Three Months
 *   Ended" spans both years and "Average Price Paid per Share" sits over the
 *   price, not over its dollar sign.
 *
 * What is not a table of figures is left alone. Filers also use tables to lay
 * out bullets and paragraphs, and those read better as text: a table here needs
 * two rows, two columns, a figure somewhere after the first column, no merged
 * rows and no cell long enough to be a paragraph. The figure is what rules out
 * bullet lists, which filers lay out as a column of bullets beside the text.
 */

import { decodeEntities } from "./entities";

export type TableCell = {
  text: string;
  /** Which of the table's columns the cell starts in, counted from 0. */
  column: number;
  /** How many of those columns it covers. */
  span: number;
};

export type TableRow = { cells: TableCell[]; header: boolean };

export type ParsedTable = {
  rows: TableRow[];
  columns: number;
};

/** Longer than this and a cell is a paragraph laid out in a table, not a figure or a label. */
const CELL_MAX = 300;
/** Headings are the rows above the first figure; more than this and the table has no figures at all. */
const HEADER_MAX = 4;

/** The entity decoding and whitespace rules the plain text uses, for one cell. */
export function decodeCell(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/[\s\S]+/, decodeEntities)
    .replace(/\s+/g, " ")
    .trim();
}

type RawCell = { text: string; start: number; span: number };

const OPENS = /^[$€£¥(]+$/;
const CLOSES = /^[)%]+$|^\)%$/;

/** A figure: an amount, a percentage, a bracketed negative, or a dash standing for nil. */
const FIGURE = /^[$€£¥(]*\s*-?[\d,]*\.?\d+\s*\)?%?$|^[-—–]$/;
/** A figure that could not be a year or a heading's date: it has a thousands separator or decimals. */
const AMOUNT = /\d{1,3}(,\d{3})+|\d\.\d/;

/** Join the parts of one visible cell: "$" and "97.47" read "$97.47", "(1,234" and ")" read "(1,234)". */
function joinParts(parts: string[]): string {
  return parts.reduce((joined, part) => {
    if (!joined) return part;
    return /[$€£¥(]$/.test(joined) || /^[)%]/.test(part) ? joined + part : `${joined} ${part}`;
  }, "");
}

/** Cells of each row, with where each starts in the table's grid, before any grouping. */
function rawRows(html: string): RawCell[][] | null {
  const rows: RawCell[][] = [];
  /*
   * Columns still covered by a cell merged down from a row above. A merged cell
   * holds its text once, in its first row, and the rows under it start their
   * own cells after it. These tables were once left as text, which is where
   * most of the lone "$", ")" and "-" lines came from: 55 of IBM's quarterly
   * tables and 20 of Exxon's merge cells this way (measured 2026-09-16).
   */
  let covered: number[] = [];
  for (const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells: RawCell[] = [];
    const next = covered.map((rowsLeft) => Math.max(0, rowsLeft - 1));
    let column = 0;
    for (const cell of row[1].matchAll(/<t[dh]\b([^>]*?)(?:\/>|>([\s\S]*?)<\/t[dh]>)/gi)) {
      while ((covered[column] ?? 0) > 0) column += 1;
      const span = Math.max(1, Number.parseInt(cell[1].match(/colspan\s*=\s*"?(\d+)/i)?.[1] ?? "1", 10) || 1);
      const down = Math.max(1, Number.parseInt(cell[1].match(/rowspan\s*=\s*"?(\d+)/i)?.[1] ?? "1", 10) || 1);
      const text = decodeCell(cell[2] ?? "");
      if (text) cells.push({ text, start: column, span });
      if (down > 1) for (let at = column; at < column + span; at += 1) next[at] = down - 1;
      column += span;
    }
    covered = next;
    if (cells.length) rows.push(cells);
  }
  return rows;
}

/** Fold lone "$", "(" into the cell after and ")", "%" into the cell before. */
function attach(cells: RawCell[]): { text: string; start: number; end: number }[] {
  const out: { parts: string[]; start: number; end: number }[] = [];
  let pending: RawCell[] = [];
  for (const cell of cells) {
    if (OPENS.test(cell.text)) {
      pending.push(cell);
      continue;
    }
    if (CLOSES.test(cell.text) && out.length && !pending.length) {
      const last = out[out.length - 1];
      last.parts.push(cell.text);
      last.end = Math.max(last.end, cell.start + cell.span);
      continue;
    }
    out.push({ parts: [...pending.map((item) => item.text), cell.text], start: cell.start, end: cell.start + cell.span });
    pending = [];
  }
  if (pending.length) {
    out.push({ parts: pending.map((item) => item.text), start: pending[0].start, end: pending[pending.length - 1].start + 1 });
  }
  return out.map((cell) => ({ text: joinParts(cell.parts), start: cell.start, end: cell.end }));
}

/**
 * A figures table's rows and columns, or null for anything that reads better as
 * text. Rows come back in document order with empty rows dropped, so row `i`
 * is the `i`th non-empty row of the markup.
 */
export function parseTable(html: string): ParsedTable | null {
  if (/<table\b/i.test(html.slice(1))) return null;
  const raw = rawRows(html);
  if (!raw || raw.length < 2) return null;
  const rows = raw.map(attach);
  const figures = rows.reduce((count, row) => count + row.filter((cell, index) => index > 0 && FIGURE.test(cell.text)).length, 0);
  if (!figures) return null;
  // Paragraphs laid out in a table have long cells and few figures. One long
  // footnote under Exxon's segment table, among dozens of figures, does not
  // make that table a paragraph.
  const longCells = raw.reduce((count, row) => count + row.filter((cell) => cell.text.length > CELL_MAX).length, 0);
  if (longCells && figures < longCells * 8) return null;
  // Headings are the rows above the first amount that have something over the
  // figures. A year on its own is a heading; "Financial Results:" alone in the
  // first column is a label for the rows under it.
  const firstData = rows.findIndex((row) => row.some((cell, index) => index > 0 && AMOUNT.test(cell.text) && FIGURE.test(cell.text)));
  const leading = firstData === -1 ? [] : rows.slice(0, Math.min(firstData, HEADER_MAX));
  const firstLabel = leading.findIndex((row) => row.every((cell) => cell.start === row[0].start && row.length === 1) && row[0].start === rows[firstData][0].start);
  const headerCount = firstLabel === -1 ? leading.length : firstLabel;
  const body = rows.slice(headerCount);

  const columns = columnsOf(body);
  if (columns.length < 2) return null;
  const columnOf = (at: number) => {
    let found = 0;
    columns.forEach((starts, index) => {
      if (starts[0] <= at) found = index;
    });
    return found;
  };

  const grouped: TableRow[] = rows.map((row, index) => {
    const header = index < headerCount;
    const placed: { parts: string[]; column: number; span: number }[] = [];
    for (const cell of row) {
      // A cell covers the columns that start inside it, or else the one it starts in.
      const inside = columns
        .map((starts, column) => ({ starts, column }))
        .filter(({ starts }) => starts.some((start) => start >= cell.start && start < cell.end));
      const column = inside[0]?.column ?? columnOf(cell.start);
      const span = Math.max(1, inside.length);
      const previous = placed[placed.length - 1];
      if (previous && column < previous.column + previous.span) {
        // Two cells landing in one column read as one: "Total" and "revenues" split by the filer.
        previous.parts.push(cell.text);
        previous.span = Math.max(previous.span, column + span - previous.column);
      } else {
        placed.push({ parts: [cell.text], column, span });
      }
    }
    return { header, cells: placed.map((cell) => ({ text: joinParts(cell.parts), column: cell.column, span: cell.span })) };
  });

  return { rows: grouped, columns: columns.length };
}

/**
 * The table's visible columns, each as the grid positions its cells start at.
 *
 * A column starts wherever a cell in the body starts, and two starts are one
 * column when some cell at the first reaches over the second and no row has a
 * cell at each. Netflix's results table puts "$" in one cell and 12,559,938 in
 * the next, while its operating margin, 33.4%, fills both: counted apart, the
 * figures and the percentages sat in different columns under one year.
 */
function columnsOf(body: { start: number; end: number }[][]): number[][] {
  const starts = [...new Set(body.flatMap((row) => row.map((cell) => cell.start)))].sort((a, b) => a - b);
  const columns: number[][] = [];
  for (const start of starts) {
    const current = columns[columns.length - 1];
    const reaches = current && body.some((row) => row.some((cell) => current.includes(cell.start) && cell.end > start));
    const together = current && body.some((row) => row.some((cell) => cell.start === start) && row.some((cell) => current.includes(cell.start)));
    if (current && reaches && !together) current.push(start);
    else columns.push([start]);
  }
  return columns;
}

/**
 * A table that is not drawn as a table, as lines of text: one line to a row,
 * its cells a space apart, a dollar sign kept with its figure. Johnson &
 * Johnson lays some rows out as tables of their own, and cell by cell they
 * reached the reader as a "$" on one line and "11.1" on the next. A table with
 * a cell long enough to be a paragraph keeps its own line breaks instead: those
 * cells hold several paragraphs each.
 */
export function tableLines(html: string): string[] | null {
  if (/<table\b/i.test(html.slice(1))) return null;
  const raw = rawRows(html);
  if (!raw || !raw.length || raw.some((row) => row.some((cell) => cell.text.length > CELL_MAX))) return null;
  return raw.map((row) => attach(row).map((cell) => cell.text).join(" "));
}

/** A row as the plain text holds it: its cells, in order, one space apart. */
export function rowText(row: TableRow): string {
  return row.cells.map((cell) => cell.text).join(" ");
}

/** Whether a cell holds a figure, which the reader aligns to the right. */
export function isFigure(text: string): boolean {
  return FIGURE.test(text.replace(/\s+/g, ""));
}
