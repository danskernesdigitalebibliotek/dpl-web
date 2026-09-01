import { describe, expect, it } from "vitest"

import { parseAndMapFees } from "./fees.mapper"

describe("parseAndMapFees", () => {
  it("maps an empty list", () => {
    expect(parseAndMapFees([])).toEqual([])
  })

  it("maps fee details to the domain shape", () => {
    const raw = [
      {
        feeId: 7,
        amount: 58,
        creationDate: "2026-06-01",
        dueDate: "2026-07-01",
        reasonMessage: "Overskredet afleveringsfrist",
        type: "fee",
        payableByClient: false,
        materials: [{ materialItemNumber: "5001234567" }, { materialItemNumber: "5001234568" }],
      },
    ]

    expect(parseAndMapFees(raw)).toEqual([
      {
        feeId: 7,
        amount: 58,
        creationDate: "2026-06-01",
        dueDate: "2026-07-01",
        reasonMessage: "Overskredet afleveringsfrist",
        type: "fee",
        payableByClient: false,
        materialCount: 2,
      },
    ])
  })

  it("maps missing dueDate and materials to undefined and zero", () => {
    const raw = [
      {
        feeId: 8,
        amount: 25.5,
        creationDate: "2026-06-01",
        reasonMessage: "Erstatning",
        type: "compensation",
        payableByClient: true,
      },
    ]

    const [fee] = parseAndMapFees(raw)
    expect(fee.dueDate).toBeUndefined()
    expect(fee.materialCount).toBe(0)
  })

  it("keeps unrecognized fee types as-is for the consumer to bucket", () => {
    const raw = [
      {
        feeId: 9,
        amount: 10,
        creationDate: "2026-06-01",
        reasonMessage: "",
        type: "someUndocumentedType",
        payableByClient: true,
        materials: [],
      },
    ]

    expect(parseAndMapFees(raw)[0].type).toBe("someUndocumentedType")
  })

  it("throws on non-array input", () => {
    expect(() => parseAndMapFees({})).toThrow()
    expect(() => parseAndMapFees(null)).toThrow()
  })

  it("throws on missing required fields", () => {
    expect(() => parseAndMapFees([{ feeId: 1, amount: 10 }])).toThrow()
  })
})
