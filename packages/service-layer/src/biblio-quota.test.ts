import { describe, expect, it } from "vitest"

import { getDigitalLoanQuota } from "./biblio"
import { type DigitalLoanQuota } from "./types"

describe("getDigitalLoanQuota", () => {
  const splitQuota: DigitalLoanQuota = {
    splitOnFormat: true,
    orgId: "org-1",
    orgName: "Eksempel Biblioteket",
    maxLoans: { ebook: 7, audiobook: 5 },
    maxConcurrentLoans: { ebook: 3, audiobook: 2 },
    currentConcurrentLoans: { ebook: 1, audiobook: 0 },
    currentMonthlyLoans: { ebook: 4, audiobook: 2 },
  }

  const combinedQuota: DigitalLoanQuota = {
    splitOnFormat: false,
    orgId: "org-2",
    orgName: "Eksempel Biblioteket",
    maxLoans: 10,
    maxConcurrentLoans: 4,
    currentConcurrentLoans: 2,
    currentMonthlyLoans: 6,
  }

  it("Reads the monthly counters per format when the organization splits on format", () => {
    expect(getDigitalLoanQuota({ quotas: [splitQuota], format: "ebook" })).toEqual({
      current: 4,
      limit: 7,
    })
    expect(getDigitalLoanQuota({ quotas: [splitQuota], format: "audiobook" })).toEqual({
      current: 2,
      limit: 5,
    })
  })

  it("Uses the same counters for both formats when the organization combines them", () => {
    expect(getDigitalLoanQuota({ quotas: [combinedQuota], format: "ebook" })).toEqual({
      current: 6,
      limit: 10,
    })
    expect(getDigitalLoanQuota({ quotas: [combinedQuota], format: "audiobook" })).toEqual({
      current: 6,
      limit: 10,
    })
  })

  it("Reads the concurrent counters when asked for loans held right now", () => {
    expect(
      getDigitalLoanQuota({ quotas: [splitQuota], format: "ebook", period: "concurrent" })
    ).toEqual({
      current: 1,
      limit: 3,
    })
    expect(
      getDigitalLoanQuota({ quotas: [splitQuota], format: "audiobook", period: "concurrent" })
    ).toEqual({
      current: 0,
      limit: 2,
    })
    expect(
      getDigitalLoanQuota({ quotas: [combinedQuota], format: "ebook", period: "concurrent" })
    ).toEqual({
      current: 2,
      limit: 4,
    })
  })

  it("Falls back to an unknown limit when there is no quota", () => {
    expect(getDigitalLoanQuota({ quotas: undefined, format: "ebook" })).toEqual({
      current: 0,
      limit: undefined,
    })
    expect(getDigitalLoanQuota({ quotas: [], format: "ebook" })).toEqual({
      current: 0,
      limit: undefined,
    })
  })
})
