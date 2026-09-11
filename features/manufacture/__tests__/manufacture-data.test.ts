import { describe, it, expect } from "vitest";
import {
  METALLURGY_SPECS,
  CALIBER_PARAMETERS,
  TESTING_PHASES,
} from "../data";

describe("Manufacture Data and Specifications", () => {
  it("contains complete metallurgical specifications for steel, sapphire, and leather", () => {
    expect(METALLURGY_SPECS).toHaveLength(3);

    const ids = METALLURGY_SPECS.map((s) => s.id);
    expect(ids).toContain("316l-steel");
    expect(ids).toContain("sapphire-crystal");
    expect(ids).toContain("vegetable-leather");

    METALLURGY_SPECS.forEach((spec) => {
      expect(spec.title).toBeTruthy();
      expect(spec.description).toBeTruthy();
      expect(spec.metrics.length).toBeGreaterThanOrEqual(3);
      spec.metrics.forEach((metric) => {
        expect(metric.label).toBeTruthy();
        expect(metric.value).toBeTruthy();
      });
    });
  });

  it("contains Caliber NW-CAL.01 technical parameter blueprint", () => {
    expect(CALIBER_PARAMETERS.length).toBeGreaterThanOrEqual(7);

    const labels = CALIBER_PARAMETERS.map((p) => p.label);
    expect(labels).toContain("CALIBER REFERENCE");
    expect(labels).toContain("FREQUENCY");
    expect(labels).toContain("JEWELS");
    expect(labels).toContain("POWER RESERVE");
    expect(labels).toContain("REGULATION TOLERANCE");
    expect(labels).toContain("WATER RESISTANCE");
    expect(labels).toContain("SHOCK PROTECTION");

    const tolerance = CALIBER_PARAMETERS.find(
      (p) => p.label === "REGULATION TOLERANCE"
    );
    expect(tolerance?.isHighlighted).toBe(true);
    expect(tolerance?.value).toContain("-4 / +6 SEC / DAY");
  });

  it("contains four sequential verification testing protocol phases", () => {
    expect(TESTING_PHASES).toHaveLength(4);

    expect(TESTING_PHASES[0].phaseNumber).toBe("01");
    expect(TESTING_PHASES[1].phaseNumber).toBe("02");
    expect(TESTING_PHASES[2].phaseNumber).toBe("03");
    expect(TESTING_PHASES[3].phaseNumber).toBe("04");

    TESTING_PHASES.forEach((phase) => {
      expect(phase.chamberRef).toBeTruthy();
      expect(phase.title).toBeTruthy();
      expect(phase.description).toBeTruthy();
    });
  });
});
