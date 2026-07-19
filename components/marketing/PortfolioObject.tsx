"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * PortfolioObject — an orbital constellation core.
 *
 * Concept: "a portfolio is a system of relationships."
 * A central nucleus (the portfolio) with orbiting asset nodes connected
 * by correlation arcs. Node sizes encode weight; arc thickness encodes
 * correlation. The whole system breathes and slowly rotates — reinforcing
 * that risk emerges from interaction, not from any single asset.
 * Pure SVG + CSS.
 */

const orbits = [
  { r: 70, duration: 30, nodes: [{ label: "EQ", weight: 45, color: "#22d3ee", angle: 20 }] },
  {
    r: 105,
    duration: 45,
    nodes: [
      { label: "IGB", weight: 25, color: "#34d399", angle: 140 },
      { label: "EM", weight: 10, color: "#fbbf24", angle: 260 },
    ],
  },
  {
    r: 140,
    duration: 60,
    nodes: [
      { label: "GLD", weight: 10, color: "#a78bfa", angle: 70 },
      { label: "CSH", weight: 10, color: "#f87171", angle: 200 },
    ],
  },
];

export default function PortfolioObject({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.2, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);

  return (
    <motion.div ref={ref} style={{ opacity, scale }} className={`pointer-events-none relative ${className ?? ""}`} aria-hidden>
      <div className="relative aspect-square w-full">
        {/* ambient glow */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(167,139,250,0.14),transparent_60%)]" />

        <svg viewBox="0 0 360 360" className="relative h-full w-full">
          <defs>
            <radialGradient id="poCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
            <filter id="poGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* orbit paths */}
          {orbits.map((o, i) => (
            <circle
              key={i}
              cx="180"
              cy="180"
              r={o.r}
              fill="none"
              stroke="#a78bfa"
              strokeWidth="0.5"
              opacity="0.2"
              strokeDasharray="2 4"
            />
          ))}

          {/* correlation arcs between orbit nodes — drawn first (behind nodes) */}
          {orbits.flatMap((o, oi) =>
            o.nodes.map((n, ni) => {
              const rad = (n.angle * Math.PI) / 180;
              const x = 180 + o.r * Math.cos(rad);
              const y = 180 + o.r * Math.sin(rad);
              // connect to core
              return (
                <motion.line
                  key={`arc-${oi}-${ni}`}
                  x1={x}
                  y1={y}
                  x2="180"
                  y2="180"
                  stroke={n.color}
                  strokeWidth="0.6"
                  opacity="0.25"
                  strokeDasharray="1 3"
                  animate={reduce ? {} : { opacity: [0.1, 0.4, 0.1] }}
                  transition={{ duration: 5, repeat: Infinity, delay: (oi + ni) * 0.5, ease: "easeInOut" }}
                />
              );
            }),
          )}

          {/* orbiting nodes — each orbit rotates as a group */}
          {orbits.map((o, oi) => (
            <motion.g
              key={oi}
              style={{ transformOrigin: "180px 180px" }}
              animate={reduce ? {} : { rotate: oi % 2 === 0 ? 360 : -360 }}
              transition={{ duration: o.duration, repeat: Infinity, ease: "linear" }}
            >
              {o.nodes.map((n, ni) => {
                const rad = (n.angle * Math.PI) / 180;
                const x = 180 + o.r * Math.cos(rad);
                const y = 180 + o.r * Math.sin(rad);
                const size = 4 + n.weight / 8;
                return (
                  <g key={ni}>
                    <circle cx={x} cy={y} r={size + 4} fill={n.color} opacity="0.15" filter="url(#poGlow)" />
                    <circle cx={x} cy={y} r={size} fill={n.color} fillOpacity="0.3" stroke={n.color} strokeWidth="1.2" />
                    <text
                      x={x}
                      y={y + size + 10}
                      textAnchor="middle"
                      fontSize="8"
                      fill={n.color}
                      fontFamily="ui-monospace, monospace"
                      opacity="0.8"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </motion.g>
          ))}

          {/* core — the portfolio nucleus */}
          <motion.circle
            cx="180"
            cy="180"
            r="36"
            fill="url(#poCore)"
            animate={reduce ? {} : { scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "180px 180px" }}
          />
          <circle cx="180" cy="180" r="28" fill="none" stroke="#a78bfa" strokeWidth="0.8" opacity="0.4" />
          <text x="180" y="178" textAnchor="middle" fontSize="9" fill="#a78bfa" fontFamily="ui-monospace, monospace" opacity="0.9">
            PORT
          </text>
          <text x="180" y="190" textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="ui-monospace, monospace">
            system
          </text>
        </svg>
      </div>
    </motion.div>
  );
}
