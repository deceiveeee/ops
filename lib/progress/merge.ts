export type ModuleCompletion = Record<string, boolean>;
export type ProgressDoc = Record<string, ModuleCompletion>;

export function unionDocs(a: ProgressDoc, b: ProgressDoc): ProgressDoc {
  const out: ProgressDoc = { ...a };
  for (const key of Object.keys(b)) {
    const aMod = a[key] ?? {};
    const bMod = b[key] ?? {};
    const merged: ModuleCompletion = { ...aMod };
    for (const slug of Object.keys(bMod)) {
      if (bMod[slug]) merged[slug] = true;
    }
    out[key] = merged;
  }
  return out;
}
