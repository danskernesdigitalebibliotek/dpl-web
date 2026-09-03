import { describe, expect, it } from "vitest"

import { isBiblioMaterialAvailable } from "./biblio"

describe("isBiblioMaterialAvailable", () => {
  it("Treats a loanable material as available", () => {
    expect(isBiblioMaterialAvailable("loanable")).toBe(true)
  })

  it.each(["reservable", "wishable", "unavailable"] as const)(
    "Treats a material that can only be %s as unavailable",
    status => {
      expect(isBiblioMaterialAvailable(status)).toBe(false)
    }
  )

  it.each([
    "monthly_limit_exceeded",
    "concurrent_limit_exceeded",
    "no_valid_credentials",
    "lending_blocked",
  ] as const)(
    "Keeps the material available when %s describes the user, not the material",
    status => {
      expect(isBiblioMaterialAvailable(status)).toBe(true)
    }
  )
})
