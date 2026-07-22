"use client";

import { Reveal, SectionHeading, Panel, Feedback } from "@/components/lessons/intro-course-overview/shared";

// Re-export the generic OPS primitives so PV lessons have a single import surface
// and stay visually consistent with Module 1.
export { Reveal, SectionHeading, Panel, Feedback };

export const PV_SOURCE_BASIS = {
  course: "MIT OCW 15.401 Finance Theory I",
  lecture: "Present Value Relations",
  instructor: "Andrew W. Lo",
  note: "Adapted from MIT OpenCourseWare 15.401 Finance Theory I for educational use. No live market data.",
} as const;

export const PV_MODULE_LESSONS = [
  { slug: "present-value-cashflows-assets-npv", title: "Cashflows, Assets, and NPV", shortTitle: "Cashflows and NPV", n: 1 },
  { slug: "present-value-perpetuities-annuities-compounding", title: "Perpetuities, Annuities, and Compounding", shortTitle: "Special Cashflows", n: 2 },
  { slug: "present-value-inflation-real-nominal", title: "Inflation, Real vs Nominal Value", shortTitle: "Real vs Nominal", n: 3 },
  { slug: "present-value-cfo-decision-room", title: "CFO Decision Room: Present Value Capstone", shortTitle: "CFO Decision Room", n: 4 },
] as const;
