import { describe, expect, it } from "vitest"

import { parseAndMapReservationLimits } from "./organization-configs.mapper"

describe("parseAndMapReservationLimits", () => {
  it("reads the ceiling per format when the organization splits on format", () => {
    expect(
      parseAndMapReservationLimits({
        organization_configurations: {
          split_on_format: true,
          loan_config: { max_concurrent_user_reservations: { ebook: 3, audiobook: 2 } },
          combined_loan_config: { max_concurrent_user_reservations: 99 },
        },
      })
    ).toEqual({ ebook: 3, audiobook: 2 })
  })

  it("reports no ceiling when the organization counts the formats together", () => {
    expect(
      parseAndMapReservationLimits({
        organization_configurations: {
          split_on_format: false,
          combined_loan_config: { max_concurrent_user_reservations: 5 },
        },
      })
    ).toBeNull()
  })

  it("reports no ceiling when the organization configures none", () => {
    expect(
      parseAndMapReservationLimits({
        organization_configurations: { split_on_format: true, loan_config: {} },
      })
    ).toBeNull()
  })

  it("parses a response that omits the config the organization does not run on", () => {
    expect(
      parseAndMapReservationLimits({
        organization_configurations: {
          split_on_format: true,
          loan_config: { max_concurrent_user_reservations: { ebook: 3, audiobook: 2 } },
        },
      })
    ).toEqual({ ebook: 3, audiobook: 2 })
  })

  it("throws on a response that is not an organization configuration", () => {
    expect(() => parseAndMapReservationLimits({ organization_configurations: {} })).toThrow()
  })
})
