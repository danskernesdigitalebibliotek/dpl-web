import { type Fee } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { describe, expect, it } from "vitest"

import { summarizeFees } from "@/lib/helpers/helper.fees"

const fee = (overrides: Partial<Fee> = {}): Fee => ({
  feeId: 1,
  amount: 10,
  creationDate: "2026-06-01",
  dueDate: undefined,
  reasonMessage: "",
  type: "fee",
  payableByClient: false,
  materialCount: 1,
  ...overrides,
})

describe("summarizeFees", () => {
  it("returns zeroes for no fees", () => {
    expect(summarizeFees([])).toEqual({
      unpaidTotal: 0,
      lateFeeTotal: 0,
      lateMaterialCount: 0,
      compensationTotal: 0,
      compensationMaterialCount: 0,
    })
  })

  it("splits overdue fees and compensations into their own buckets", () => {
    const summary = summarizeFees([
      fee({ amount: 58, materialCount: 3 }),
      fee({ type: "compensation", amount: 250, materialCount: 2 }),
    ])

    expect(summary).toEqual({
      unpaidTotal: 58,
      lateFeeTotal: 58,
      lateMaterialCount: 3,
      compensationTotal: 250,
      compensationMaterialCount: 2,
    })
  })

  it("counts unrecognized fee types toward the unpaid total but neither modal bucket", () => {
    const summary = summarizeFees([
      fee({ amount: 58 }),
      fee({ type: "someUndocumentedType", amount: 25 }),
    ])

    expect(summary.unpaidTotal).toBe(83)
    expect(summary.lateFeeTotal).toBe(58)
    expect(summary.compensationTotal).toBe(0)
  })

  it("falls back to the fee count when fees carry no materials", () => {
    const summary = summarizeFees([
      fee({ materialCount: 0 }),
      fee({ materialCount: 0 }),
      fee({ type: "compensation", materialCount: 0 }),
    ])

    expect(summary.lateMaterialCount).toBe(2)
    expect(summary.compensationMaterialCount).toBe(1)
  })

  it("sums materials across multiple fees of the same type", () => {
    const summary = summarizeFees([fee({ materialCount: 2 }), fee({ materialCount: 1 })])

    expect(summary.lateMaterialCount).toBe(3)
  })
})
