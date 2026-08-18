"use client";

import { motion, useReducedMotion } from "motion/react";

const ROLES = [
  {
    label: "Ready",
    job: "Known near-term needs",
    className:
      "left-[7%] top-[47%] h-28 w-28 border-accent-cyan/30 bg-accent-cyan/[0.08] sm:h-36 sm:w-36",
    delay: 0.08,
  },
  {
    label: "Steady",
    job: "A stabilizing role",
    className:
      "left-[35%] top-[17%] h-36 w-36 border-accent-amber/30 bg-accent-amber/[0.08] sm:h-44 sm:w-44",
    delay: 0.18,
  },
  {
    label: "Grow",
    job: "Long-horizon risk capital",
    className:
      "right-[4%] top-[38%] h-40 w-40 border-accent-purple/30 bg-accent-purple/[0.08] sm:h-52 sm:w-52",
    delay: 0.28,
  },
] as const;

/**
 * One-run opener: the scan resolves an unassigned pool of capital into three
 * broad jobs. It is deliberately atmospheric only; the labelled Allocation
 * Studio and table carry every instructional value later in the mission.
 */
export default function AllocationPolicyHeroVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="ops-interactive-frame relative min-h-[330px] rounded-[32px] sm:min-h-[390px]"
      aria-label="A portfolio resolving into Ready, Steady, and Grow roles"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_58%_25%,rgba(124,58,237,0.10),transparent_32%),radial-gradient(circle_at_18%_72%,rgba(8,145,178,0.12),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[23%] border-t border-white/10" />
      <div className="pointer-events-none absolute inset-x-0 top-[69%] border-t border-white/10" />

      {ROLES.map((role) => (
        <motion.div
          key={role.label}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.78, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.75,
            delay: reduceMotion ? 0 : role.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          data-testid={`policy-role-${role.label.toLowerCase()}`}
          className={`absolute flex -translate-y-1/2 flex-col items-center justify-center rounded-full border text-center backdrop-blur-sm motion-reduce:!transform-none motion-reduce:!opacity-100 motion-reduce:!transition-none ${role.className}`}
        >
          <span className="ops-body-strong text-[15px] font-semibold tracking-[-0.01em] sm:text-[17px]">
            {role.label}
          </span>
          <span className="ops-body mt-1 max-w-[9rem] px-3 text-[12px] leading-4 sm:text-[13px]">
            {role.job}
          </span>
        </motion.div>
      ))}

      {!reduceMotion && (
        <motion.div
          aria-hidden
          data-testid="policy-scan-beam"
          className="pointer-events-none absolute -inset-y-8 w-28 bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent blur-sm motion-reduce:hidden"
          initial={{ x: "-140%", opacity: 0 }}
          animate={{ x: ["-140%", "520%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.7, delay: 0.35, ease: "easeInOut" }}
        />
      )}

      <div className="glass absolute inset-x-5 bottom-5 flex items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:inset-x-7 sm:bottom-7">
        <div>
          <div className="text-[12px] font-semibold tracking-[0.01em] text-accent-cyan">
            Policy scan
          </div>
          <div className="ops-body-strong mt-0.5 text-[13px] sm:text-[14px]">
            Roles first. Products later.
          </div>
        </div>
        <div className="ops-muted flex items-center gap-2 text-[12px]">
          <span className="h-2 w-2 rounded-full bg-accent-green" aria-hidden />
          Three jobs identified
        </div>
      </div>
    </div>
  );
}
