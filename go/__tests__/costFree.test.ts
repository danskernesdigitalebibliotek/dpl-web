import { LoanDecision } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { describe, expect, test } from "vitest"

import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import {
  getLoanDecisionMaterialIds,
  getPreferredManifestation,
  isManifestationCostFree,
} from "@/lib/helpers/helper.costFree"

const manifestation = (pid: string, code: string, isbn: string) =>
  ({
    pid,
    materialTypes: [{ materialTypeSpecific: { code } }],
    identifiers: [{ type: "ISBN", value: isbn }],
  }) as unknown as ManifestationWorkPageFragment

const blue: LoanDecision = { status: "loanable", loanProvider: "selection" }
const notBlue: LoanDecision = { status: "loanable", loanProvider: "click" }

describe("getLoanDecisionMaterialIds", () => {
  test("asks about digital manifestations only", () => {
    const ids = getLoanDecisionMaterialIds([
      manifestation("ebook", "EBOOK", "1"),
      manifestation("book", "BOOK", "2"),
      manifestation("audio", "AUDIO_BOOK_ONLINE", "3"),
    ])

    expect(ids).toEqual(["1", "3"])
  })
})

describe("isManifestationCostFree", () => {
  test("is true for a digital manifestation the decision marks as selection", () => {
    expect(isManifestationCostFree(manifestation("ebook", "EBOOK", "1"), { "1": blue })).toBe(true)
  })

  test("is false for a digital manifestation with another loan provider", () => {
    expect(isManifestationCostFree(manifestation("ebook", "EBOOK", "1"), { "1": notBlue })).toBe(
      false
    )
  })

  test("is false for a digital manifestation with no decision", () => {
    expect(isManifestationCostFree(manifestation("ebook", "EBOOK", "1"), {})).toBe(false)
  })

  test("is always true for a podcast", () => {
    expect(isManifestationCostFree(manifestation("podcast", "PODCAST", "1"), {})).toBe(true)
  })

  test("is never true for a physical manifestation", () => {
    expect(isManifestationCostFree(manifestation("book", "BOOK", "1"), { "1": blue })).toBe(false)
  })
})

describe("getPreferredManifestation", () => {
  const newest = manifestation("newest", "EBOOK", "1")
  const older = manifestation("older", "EBOOK", "2")
  const oldest = manifestation("oldest", "EBOOK", "3")

  test("picks the newest cost-free manifestation over a newer one that is not", () => {
    const result = getPreferredManifestation([newest, older, oldest], {
      "1": notBlue,
      "2": blue,
      "3": blue,
    })

    expect(result?.pid).toBe("older")
  })

  test("falls back to the newest when none is cost-free", () => {
    const result = getPreferredManifestation([newest, older], { "1": notBlue, "2": notBlue })

    expect(result?.pid).toBe("newest")
  })

  test("falls back to the newest when no decisions have arrived", () => {
    expect(getPreferredManifestation([newest, older], {})?.pid).toBe("newest")
  })

  test("returns undefined for no manifestations", () => {
    expect(getPreferredManifestation([], {})).toBeUndefined()
  })
})
