"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * TimeValueObject — a maturity / timing wheel.
 *
 * Concept: "time is the axis of finance."
 * A dial with year markers (Y0..Y5) rotates slowly; future cash-flow nodes
 * glow as they pass the "now" pointer, then collapse toward present value
 * at the center. Reinforces duration, maturity, and discounting without
 * a single formula. Pure SVG + CSS.
 */
export default function TimeValueObject({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const rotate = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.4]);

  const years = [0, 1, 2, 3, 4, 5];
  const R = 120;

  return (
    <motion.div ref={ref} style={{ opacity }} className={`pointer-events-none relative ${className ?? ""}`} aria-hidden>
      <div className="relative aspect-square w-full">
        {/* ambient glow */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(167,139,250,0.12),transparent_60%)]" />

        <svg viewBox="0 0 300 300" className="relative h-full w-full">
          <defs>
            <radialGradient id="tvCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="tvRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
            </linearGradient>
            <filter id="tvGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* outer dial ring */}
          <circle cx="150" cy="150" r="135" fill="none" stroke="url(#tvRing)" strokeWidth="1" opacity="0.5" />
          <circle cx="150" cy="150" r="135" fill="none" stroke="#a78bfa" strokeWidth="0.5" strokeDasharray="1 6" opacity="0.4" />

          {/* rotating year markers */}
          <motion.g
            style={{ rotate, transformOrigin: "150px 150px" }}
            animate={reduce ? {} : { rotate: rotate.get() }}
          >
            {years.map((y, i) => {
              const angle = (i / years.length) * 360;
              const rad = (angle * Math.PI) / 180;
              const x = 150 + R * Math.cos(rad);
              const yy = 150 + R * Math.sin(rad);
              return (
                <g key={y}>
                  <line
                    x1={150 + (R - 12) * Math.cos(rad)}
                    y1={150 + (R - 12) * Math.sin(rad)}
                    x2={150 + (R + 8) * Math.cos(rad)}
                    y2={150 + (R + 8) * Math.sin(rad)}
                    stroke="#a78bfa"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <circle cx={x} cy={yy} r="5" fill="#a78bfa" fillOpacity="0.2" stroke="#a78bfa" strokeWidth="1" filter="url(#tvGlow)" />
                  <text
                    x={x}
                    y={yy + 3}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#cbd5e1"
                    fontFamily="ui-monospace, monospace"
                  >
                    Y{y}
                  </text>
                </g>
              );
            })}
          </motion.g>

          {/* "now" pointer — fixed, pointing up */}
          <line x1="150" y1="150" x2="150" y2="20" stroke="#22d3ee" strokeWidth="1.5" opacity="0.6" />
          <polygon points="150,14 146,24 154,24" fill="#22d3ee" opacity="0.8" />
          <text x="150" y="10" textAnchor="middle" fontSize="8" fill="#22d3ee" fontFamily="ui-monospace, monospace">
            NOW
          </text>

          {/* present-value core — cash flows collapse toward center */}
          <motion.circle
            cx="150"
            cy="150"
            r="40"
            fill="url(#tvCore)"
            animate={reduce ? {} : { scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "150px 150px" }}
          />
          <circle cx="150" cy="150" r="32" fill="none" stroke="#a78bfa" strokeWidth="0.5" opacity="0.4" strokeDasharray="2 3" />

          {/* PV label */}
          <text x="150" y="148" textAnchor="middle" fontSize="9" fill="#a78bfa" fontFamily="ui-monospace, monospace" opacity="0.8">
            PV
          </text>
          <text x="150" y="160" textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="ui-monospace, monospace">
            discount
          </text>

          {/* inward arrows — cash flows collapsing to present value */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 150 + 95 * Math.cos(rad);
            const y1 = 150 + 95 * Math.sin(rad);
            const x2 = 150 + 55 * Math.cos(rad);
            const y2 = 150 + 55 * Math.sin(rad);
            return (
              <motion.line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#a78bfa"
                strokeWidth="0.8"
                opacity="0.3"
                animate={reduce ? {} : { opacity: [0.1, 0.5, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
              />
            );
          })}
        </svg>
      </div>
    </motion.div>
  );
}
