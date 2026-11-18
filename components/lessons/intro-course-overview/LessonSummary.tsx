/**
 * What the lesson is about, in a sentence and a few topic tags.
 *
 * This is the text that used to sit in the title block above everything else.
 * Each Module 1 lesson now opens on its first activity, so the summary follows
 * that activity instead of standing in front of it.
 *
 * Each tag carries one of the lesson's section tones, in page order: the first
 * is the opening's teal, the next two are the hues of the sections that
 * follow. The tint and the dot carry the colour; the word stays in the page's
 * own ink, so the tags add no text colours.
 */
const TAG_TONES = ["ops-tone-teal", "ops-tone-blue", "ops-tone-ochre", "ops-tone-plum"];

export default function LessonSummary({
  subtitle,
  topics,
}: {
  subtitle: string;
  topics: readonly string[];
}) {
  return (
    <div>
      <p className="ops-body text-[17px] text-slate-200">{subtitle}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {topics.map((topic, i) => (
          <li
            key={topic}
            className={`${TAG_TONES[i % TAG_TONES.length]} inline-flex items-center gap-2 rounded-full bg-[var(--ops-accent-soft)] px-3 py-1 font-sans text-[13px] font-medium text-slate-100`}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-[var(--ops-accent-strong)]"
            />
            {topic}
          </li>
        ))}
      </ul>
    </div>
  );
}
