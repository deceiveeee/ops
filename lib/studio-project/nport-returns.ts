/** Extract only the reported class's three monthly returns; never infer dividends from holdings. */
export function nportClassReturns(xml: string, seriesId: string, classId: string): { month: string; value: number }[] {
  const tag = (name: string) => xml.match(new RegExp(`<${name}>([^<]+)</${name}>`))?.[1];
  if (tag("seriesId") !== seriesId) return [];
  const reported = tag("repPdDate");
  if (!reported || !/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(reported)) throw new Error("Missing N-PORT report date");
  const entries = [...xml.matchAll(/<monthlyTotReturn\s+([^>]+)\/?\s*>/g)].map((m) => Object.fromEntries([...m[1].matchAll(/(\w+)="([^"]*)"/g)].map((a) => [a[1], a[2]])));
  const matches = entries.filter((entry) => entry.classId === classId);
  if (matches.length !== 1) throw new Error(`Expected one return row for ${classId}`);
  const lastMonth = Number(reported.slice(0, 4)) * 12 + Number(reported.slice(5, 7)) - 1;
  return [1, 2, 3].map((n) => {
    const raw = matches[0][`rtn${n}`];
    if (!raw?.trim() || !Number.isFinite(Number(raw)) || Number(raw) <= -100) throw new Error(`Invalid return for ${classId}, month ${n}`);
    const index = lastMonth - 3 + n;
    return { month: `${Math.floor(index / 12)}-${String(index % 12 + 1).padStart(2, "0")}`, value: Number(raw) / 100 };
  });
}
