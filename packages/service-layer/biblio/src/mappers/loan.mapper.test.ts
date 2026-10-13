import { afterEach, describe, expect, it, vi } from "vitest"

import { parseAndMapLoans } from "./loan.mapper"

// Everything the contract requires; tests override only the field they are about.
const upstreamLoan = {
  id: "loan-1",
  material_id: "9788711234567",
  material_type: "ebook",
  start: "2026-08-01T10:00:00Z",
  end: "2026-08-31T10:00:00Z",
  active: true,
  title: "En bog",
  author: "Christie, Agatha",
  publisher: "Forlag",
  publish_date: "2014-11-07T00:00:00Z",
  license: { type: "selection" },
}

const response = (...loans: object[]) => ({ loans, pagination: {} })

const spyOnWarn = () => vi.spyOn(console, "warn").mockImplementation(() => undefined)

describe("parseAndMapLoans", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("keeps a loan of a material type outside the spec and logs it", () => {
    const warn = spyOnWarn()
    const podcast = { ...upstreamLoan, id: "loan-2", material_type: "podcast" }

    const { loans } = parseAndMapLoans(response(upstreamLoan, podcast))

    expect(loans.map(loan => loan.materialType)).toEqual(["ebook", "podcast"])
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('material_type: "podcast"'))
  })

  it("logs an unknown value once, not on every refetch", () => {
    const warn = spyOnWarn()
    const audiobookClub = { ...upstreamLoan, material_type: "audiobook_club" }

    parseAndMapLoans(response(audiobookClub, audiobookClub))
    parseAndMapLoans(response(audiobookClub))

    expect(warn).toHaveBeenCalledTimes(1)
  })

  it("still throws when a field the contract requires is missing", () => {
    expect(() => parseAndMapLoans(response({ ...upstreamLoan, title: undefined }))).toThrow()
  })
})
