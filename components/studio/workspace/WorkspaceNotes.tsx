import { STUDIO_GUIDANCE, type StudioGuidanceKey } from "@/lib/studio-guidance";
import styles from "./working-pages.module.css";

/** Existing teaching and citations, available beside the work without a second introduction. */
export default function WorkspaceNotes({ kind }: { kind: StudioGuidanceKey }) {
  const guidance = STUDIO_GUIDANCE[kind];
  return (
    <details className={styles.learningNotes}>
      <summary>How to do this, with an example <span aria-hidden="true">+</span></summary>
      <div className={styles.notesBody}>
        {kind === "research" && <p>{guidance.definition}</p>}
        <p>{guidance.action}</p>
        <p>{guidance.example}</p>
        <dl>{guidance.terms.map(item => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl>
        <ul>{guidance.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul>
      </div>
    </details>
  );
}
