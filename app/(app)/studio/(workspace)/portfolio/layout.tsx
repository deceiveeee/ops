import PortfolioNav from "@/components/studio/workspace/PortfolioNav";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PortfolioNav />
      {children}
    </>
  );
}
