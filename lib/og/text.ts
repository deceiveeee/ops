/** Cut at a word boundary, so a long subtitle ends on a whole word and an ellipsis. */
export function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:.\s]+$/, "")}…`;
}

/** Long titles get smaller type, so three lines is the most any title takes on a 1200px card. */
export function titleSize(title: string): number {
  if (title.length > 80) return 50;
  if (title.length > 52) return 58;
  return 68;
}
