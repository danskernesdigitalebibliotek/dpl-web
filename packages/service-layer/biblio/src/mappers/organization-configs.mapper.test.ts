import { describe, expect, it } from "vitest"

import { parseAndMapReservationLimits } from "./organization-configs.mapper"

// The response always carries both loan configs; split_on_format names the
// one the organization actually runs on. The other is present but stale, so
// the mapper must not read it.
const response = ({
  splitOnFormat,
  split,
  combined,
}: {
  splitOnFormat: boolean
  split?: { ebook: number; audiobook: number }
  combined?: number
}) => ({
  organization_configurations: {
    split_on_format: splitOnFormat,
    loan_config: { max_concurrent_user_reservations: split },
    combined_loan_config: { max_concurrent_user_reservations: combined },
  },
})

describe("parseAndMapReservationLimits", () => {
  it("reads the per-format ceiling when the organization splits on format", () => {
    expect(
      parseAndMapReservationLimits(
        response({ splitOnFormat: true, split: { ebook: 3, audiobook: 2 }, combined: 99 })
      )
    ).toEqual({
      splitOnFormat: true,
      maxConcurrentReservations: { ebook: 3, audiobook: 2 },
    })
  })

  it("reads the single ceiling when the organization combines the formats", () => {
    expect(
      parseAndMapReservationLimits(
        response({ splitOnFormat: false, split: { ebook: 99, audiobook: 99 }, combined: 5 })
      )
    ).toEqual({
      splitOnFormat: false,
      maxConcurrentReservations: 5,
    })
  })

  it("reports no ceiling when the organization configures none", () => {
    expect(parseAndMapReservationLimits(response({ splitOnFormat: true }))).toEqual({
      splitOnFormat: true,
      maxConcurrentReservations: undefined,
    })
  })

  it("throws on a response that is not an organization configuration", () => {
    expect(() => parseAndMapReservationLimits({ organization_configurations: {} })).toThrow()
  })
})
