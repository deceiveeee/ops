import type { Metadata } from "next";
import ValueStickView from "@/components/studio/ValueStickView";

export const metadata: Metadata = {
  title: "Where the value comes from — Investing Studio",
  description:
    "Read a business on the value stick: what a customer would pay, what it charges, what it pays, and what a supplier would accept — and which lever moves the ends of it.",
};

export default function ValuePage() {
  return <ValueStickView />;
}
