export type StudioIconName = "overview" | "goals" | "research" | "valuation" | "portfolio" | "review" | "arrow" | "company" | "report";

const paths: Record<StudioIconName, string> = {
  overview: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  goals: "M12 3v4m0 10v4M3 12h4m10 0h4M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  research: "M15.5 15.5 21 21M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z",
  portfolio: "M4 19V11h4v8M10 19V5h4v14M16 19V8h4v11M3 19h18",
  valuation: "M3 19h18M5 15l5-5 4 2 6-8M16 4h4v4",
  review: "M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 14l2 2 5-5",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  company: "M4 21V7l8-4v18M12 10h8v11M2 21h20M7 8h2M7 12h2M7 16h2M15 14h2M15 18h2",
  report: "M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8M8 16h6",
};

export default function StudioIcon({ name }: { name: StudioIconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={paths[name]} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
