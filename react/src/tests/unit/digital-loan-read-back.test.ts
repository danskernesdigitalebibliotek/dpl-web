import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  awaitReadBack,
  readBackGraceMs
} from "../../core/utils/helpers/digital-loan-read-back";

const clientThatNeverAnswers = () =>
  ({ invalidateQueries: () => new Promise<void>(() => {}) }) as QueryClient;

describe("awaitReadBack", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("resolves once the lists have answered", async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    const queryClient = { invalidateQueries } as unknown as QueryClient;

    await expect(
      awaitReadBack(queryClient, [["loans"], ["reservations"]])
    ).resolves.toBeDefined();

    // Refetched even where nothing is currently rendering the list, so the
    // promise means "the answer is in" rather than "someone was watching".
    expect(invalidateQueries).toHaveBeenCalledTimes(2);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["loans"],
      refetchType: "all"
    });
  });

  it("gives up on a read-back that never lands", async () => {
    const settled = vi.fn();
    awaitReadBack(clientThatNeverAnswers(), [["loans"]]).then(settled);

    await vi.advanceTimersByTimeAsync(readBackGraceMs - 1);
    expect(settled).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toHaveBeenCalled();
  });

  it("drops the grace timer once the lists answer", async () => {
    const queryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined)
    } as unknown as QueryClient;

    await awaitReadBack(queryClient, [["loans"]]);

    // A timer left running would keep the test environment - and a real
    // page - awake for the rest of the grace period.
    expect(vi.getTimerCount()).toBe(0);
  });
});
