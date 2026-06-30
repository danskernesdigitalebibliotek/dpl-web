import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import InstantLoan from "../../components/instant-loan/InstantLoan";
import { useEventStatistics } from "../../core/statistics/useStatistics";
import { statistics } from "../../core/statistics/statistics";
import { Manifestation } from "../../core/utils/types/entities";
import { HoldingsLogisticsV1 } from "../../core/fbs/model";

vi.mock("../../core/statistics/useStatistics", () => ({
  useEventStatistics: vi.fn()
}));

// Stub the children so the test does not pull in Cover (react-query) or useText.
vi.mock("../../components/instant-loan/InstantLoanSummary", () => ({
  default: () => <span>summary</span>
}));
vi.mock("../../components/instant-loan/InstantLoanBranch", () => ({
  default: () => <span>branch</span>
}));

const pid = "870970-basis:12345678";

const manifestation = {
  pid,
  materialTypes: [{ materialTypeSpecific: { display: "bog" } }]
} as unknown as Manifestation;

const branchHoldings = [
  { branch: { branchId: "1" }, materials: [] }
] as unknown as HoldingsLogisticsV1[];

describe("InstantLoan tracking", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("tracks a click with event id 37 and the manifestation pid when expanded", () => {
    const track = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useEventStatistics).mockReturnValue({ track });

    render(
      <InstantLoan
        manifestation={manifestation}
        instantLoanBranchHoldings={branchHoldings}
      />
    );

    expect(track).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button"));

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("click", {
      id: 37,
      name: statistics.instantLoanClick.name,
      trackedData: pid
    });
  });
});
