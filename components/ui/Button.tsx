import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "ops-btn variant-primary bg-accent-cyan text-ink-950 hover:bg-accent-cyan/90 border border-accent-cyan/40 shadow-glow",
  secondary:
    "ops-btn variant-secondary text-slate-200 hover:text-white",
  ghost:
    "ops-btn variant-ghost text-slate-200 hover:text-white hover:bg-white/5 border border-transparent",
  outline:
    "ops-btn variant-outline border border-white/15 text-slate-100 hover:border-white/30 hover:bg-white/5",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-[15px]",
  lg: "px-7 py-3.5 text-[17px]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
};

type ButtonAsLink = CommonProps & { href: string };
type ButtonAsButton = CommonProps & {
  href?: undefined;
  onClick?: () => void;
  type?: "button" | "submit";
};

export default function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "md", className, disabled } = props;
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-55 disabled:shadow-none disabled:hover:bg-accent-cyan disabled:hover:text-ink-950",
    variants[variant],
    sizes[size],
    className,
  );

  if (props.href !== undefined) {
    const ext = props.href.startsWith("http") || props.href.startsWith("#");
    if (disabled) {
      return (
        <span aria-disabled="true" className={cls}>
          {props.children}
        </span>
      );
    }
    if (ext && !props.href.startsWith("#")) {
      return (
        <a href={props.href} className={cls} target="_blank" rel="noreferrer">
          {props.children}
        </a>
      );
    }
    if (props.href.startsWith("#")) {
      return (
        <a href={props.href} className={cls}>
          {props.children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls}>
        {props.children}
      </Link>
    );
  }
  return (
    <button
      type={(props as ButtonAsButton).type ?? "button"}
      onClick={(props as ButtonAsButton).onClick}
      disabled={disabled}
      className={cls}
    >
      {props.children}
    </button>
  );
}
