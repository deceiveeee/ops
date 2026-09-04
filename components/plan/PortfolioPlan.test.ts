import { describe, expect, it } from "vitest";
import {
  EMPTY_HOLDINGS_SLATE,
  EMPTY_OPERATING_PLAN,
  EMPTY_ORDER_DRAFT,
  EMPTY_SCENARIO_RESPONSE,
  EMPTY_TIMING_POLICY,
} from "@/lib/if-progress";
import type { CheckpointState } from "@/lib/portfolio-workbench";
import {
  holdingsSlateSection,
  operatingPlanSection,
  timingPolicySection,
  type Section,
} from "./PortfolioPlan";

const STAMP = "2026-08-28T20:00:00.000Z";

const checkpoint = (status: CheckpointState["status"] = "coherent") => ({
  status,
  revision: 1,
  updatedAt: STAMP,
  acceptedDependencyRevisions: {},
});

const field = (section: Section, label: string) =>
  section.groups.flatMap((group) => group.fields).find((item) => item.label === label)
    ?.value;

describe("Portfolio plan final mission sections", () => {
  it("renders a complete no-timing decision without fake bounded-rule fields", () => {
    const section = timingPolicySection(
      "personal",
      {
        ...EMPTY_TIMING_POLICY,
        mode: "no-timing",
        reason: "My strategic allocation already reflects my horizon.",
        frictionCostPct: 3.9,
        updatedAt: STAMP,
      },
      checkpoint(),
    );

    expect(section.id).toBe("timing");
    expect(field(section, "Policy")).toMatch(/no market timing/i);
    expect(field(section, "Round-trip friction charged")).toBe("3.90%");
    expect(field(section, "Signal")).toBeUndefined();
  });

  it("carries exact fund identity and a non-transmitting order rehearsal", () => {
    const section = holdingsSlateSection(
      "personal",
      {
        ...EMPTY_HOLDINGS_SLATE,
        lines: [
          {
            ticker: "VTI",
            seriesId: "S000002848",
            classId: "C000007245",
            sleeve: "growth",
            targetWeightPct: 60,
          },
        ],
        issuerKeyMode: "issuer",
        overlapAcknowledged: true,
        staleDataAcknowledged: true,
        orderDraft: {
          ...EMPTY_ORDER_DRAFT,
          ticker: "VTI",
          classId: "C000007245",
          direction: "buy",
          approxAmountUsd: 2500,
          orderType: "limit",
          estimatedFrictionPct: 0.95,
        },
        updatedAt: STAMP,
      },
      checkpoint(),
    );

    expect(section.id).toBe("holdings");
    expect(field(section, "VTI 1")).toContain(
      "SEC series S000002848; class C000007245",
    );
    expect(field(section, "Estimated one-way friction")).toBe("0.95%");
    expect(field(section, "Transmission")).toMatch(/not transmitted/i);
  });

  it("compiles all nine flight-test decisions and the transfer result", () => {
    const scenarioIds = [
      "crash",
      "income",
      "cash",
      "contribution",
      "drift",
      "thesis",
      "stale",
      "licence",
      "mandate",
    ];
    const scenarioResponses = Object.fromEntries(
      scenarioIds.map((id) => [
        id,
        {
          ...EMPTY_SCENARIO_RESPONSE,
          response: "review" as const,
          controllingPolicy: "rebalance",
        },
      ]),
    );

    const section = operatingPlanSection(
      "practice",
      {
        ...EMPTY_OPERATING_PLAN,
        mode: "practice",
        reviewProcess: "Review every quarter and after a mandate change.",
        rebalanceRule: {
          trigger: "threshold",
          cadenceMonths: 0,
          bandBps: 500,
          method: "new-money",
        },
        contributionRule: "Direct new money to the most underweight sleeve.",
        withdrawalRule: "Use the liquidity sleeve first.",
        sellReplaceRule: "Replace only after identity and exposure checks.",
        thesisBreakRule: "Review when the stated exposure changes.",
        scenarioResponses,
        transferCaseId: "OPS-TRANSFER-01",
        transferCasePassed: true,
        updatedAt: STAMP,
      },
      checkpoint(),
    );

    const flightTest = section.groups.find(
      (group) => group.heading === "Portfolio flight test",
    );
    expect(section.id).toBe("policy");
    expect(flightTest?.fields).toHaveLength(9);
    expect(field(section, "Rebalance trigger")).toBe("Threshold band of 5%");
    expect(field(section, "Result")).toBe("Passed");
    expect(field(section, "Critical failures")).toEqual(["None recorded"]);
  });
});
