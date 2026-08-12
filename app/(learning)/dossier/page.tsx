import type { Metadata } from "next";
import PortfolioDossier from "@/components/dossier/PortfolioDossier";

export const metadata: Metadata = {
  title: "Your portfolio dossier — Open Portfolio Studio",
  description:
    "Every decision you have recorded across Investment Foundations, assembled into one portfolio dossier.",
};

export default function DossierPage() {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      <div className="relative">
        <PortfolioDossier />
      </div>
    </div>
  );
}
