import { cn } from "@/lib/utils";

export default function GlassPanel({
  className,
  children,
  glow = false,
}: {
  className?: string;
  children: React.ReactNode;
  glow?: boolean;
}) {
  return (
    <div className={cn("glass-panel relative overflow-hidden p-6", glow && "shadow-glow", className)}>{children}</div>
  );
}
