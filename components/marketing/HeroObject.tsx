"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

type Props = {
  /** External scroll progress for parallax (optional). When provided, the
   *  object drifts and fades as the user scrolls into the story. */
  scrollYProgress?: MotionValue<number>;
  className?: string;
};

/**
 * HeroObject — a kinetic orbital ring sculpture.
 *
 * Concept: "market chaos becoming structure."
 * Three tilted rings orbit a luminous core. Fragment dots (tickers, rates,
 * signals) drift on the outer rings; the inner ring is clean and structured.
 * Built entirely with SVG + CSS transforms (pseudo-3D via ellipse rotation
 * and stroke gradients). No WebGL.
 */
export default function HeroObject({ scrollYProgress, className }: Props) {
  const reduce = useReducedMotion();
  const internalRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: internalProgress } = useScroll({
    target: internalRef,
    offset: ["start start", "end start"],
  });
  const progress = scrollYProgress ?? internalProgress;

  const y = useTransform(progress, [0, 1], [0, -40]);
  const opacity = useTransform(progress, [0, 0.85], [1, 0.25]);
  const scale = useTransform(progress, [0, 1], [1, 0.92]);

  return (
    <motion.div
      ref={internalRef}
      style={{ y, opacity, scale }}
      className={`pointer-events-none relative ${className ?? ""}`}
      aria-hidden
    >
      <div className="relative aspect-square w-full">
        {/* Ambient glow behind the sculpture */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.18),transparent_60%)]" />

        <svg viewBox="0 0 400 400" className="relative h-full w-full">
          <defs>
            <linearGradient id="heroRingOuter" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="heroRingMid" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
            </linearGradient>
            <radialGradient id="heroCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#22d3ee" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
            <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer ring — tilted, "chaotic" fragments on it */}
          <motion.g
            style={{ transformOrigin: "200px 200px" }}
            animate={reduce ? {} : { rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <ellipse cx="200" cy="200" rx="170" ry="60" fill="none" stroke="url(#heroRingOuter)" strokeWidth="1.5" transform="rotate(-15 200 200)" />
            {/* fragment dots on outer ring */}
            {[0, 72, 144, 216, 288].map((deg, i) => {
              const rad = ((deg - 15) * Math.PI) / 180;
              const cx = 200 + 170 * Math.cos(rad);
              const cy = 200 + 60 * Math.sin(rad);
              const colors = ["#34d399", "#f87171", "#a78bfa", "#fbbf24", "#22d3ee"];
              return (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="3"
                  fill={colors[i]}
                  filter="url(#heroGlow)"
                  animate={reduce ? {} : { opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                />
              );
            })}
          </motion.g>

          {/* Middle ring — counter-rotating, cleaner */}
          <motion.g
            style={{ transformOrigin: "200px 200px" }}
            animate={reduce ? {} : { rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          >
            <ellipse cx="200" cy="200" rx="130" ry="130" fill="none" stroke="url(#heroRingMid)" strokeWidth="1" transform="rotate(30 200 200)" opacity="0.7" />
            {/* tick marks — structured, even */}
            {Array.from({ length: 12 }).map((_, i) => {
              const rad = (i * 30 * Math.PI) / 180;
              const x1 = 200 + 125 * Math.cos(rad);
              const y1 = 200 + 125 * Math.sin(rad);
              const x2 = 200 + 135 * Math.cos(rad);
              const y2 = 200 + 135 * Math.sin(rad);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#22d3ee" strokeWidth="1" opacity="0.4" />
              );
            })}
          </motion.g>

          {/* Inner ring — structured, slow */}
          <motion.g
            style={{ transformOrigin: "200px 200px" }}
            animate={reduce ? {} : { rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="200" cy="200" r="85" fill="none" stroke="#22d3ee" strokeWidth="0.8" opacity="0.5" strokeDasharray="2 4" />
            <circle cx="200" cy="200" r="70" fill="none" stroke="#22d3ee" strokeWidth="0.5" opacity="0.3" />
          </motion.g>

          {/* Core — luminous center, the "decoded" signal */}
          <motion.circle
            cx="200"
            cy="200"
            r="50"
            fill="url(#heroCore)"
            animate={reduce ? {} : { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "200px 200px" }}
          />
          <circle cx="200" cy="200" r="6" fill="#ffffff" filter="url(#heroGlow)" />

          {/* Crosshair — the "decoder" axis */}
          <line x1="200" y1="110" x2="200" y2="290" stroke="#22d3ee" strokeWidth="0.5" opacity="0.25" />
          <line x1="110" y1="200" x2="290" y2="200" stroke="#22d3ee" strokeWidth="0.5" opacity="0.25" />
        </svg>

        {/* Floating data labels around the sculpture */}
        <motion.div
          animate={reduce ? {} : { y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-0 top-[15%] rounded border border-white/10 bg-ink-950/60 px-2 py-1 font-mono text-[9px] text-accent-cyan backdrop-blur-sm"
        >
          SIGNAL
        </motion.div>
        <motion.div
          animate={reduce ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[12%] left-[5%] rounded border border-white/10 bg-ink-950/60 px-2 py-1 font-mono text-[9px] text-accent-purple backdrop-blur-sm"
        >
          STRUCTURE
        </motion.div>
      </div>
    </motion.div>
  );
}
