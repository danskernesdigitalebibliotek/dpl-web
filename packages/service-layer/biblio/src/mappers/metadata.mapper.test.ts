import { describe, expect, it } from "vitest"

import { parseAndMapMetadata } from "./metadata.mapper"

describe("parseAndMapMetadata", () => {
  it("maps the first ebook material to a BiblioMaterial", () => {
    const raw = {
      materials: [{ isbn: "9788711234567", material_type: "ebook" }],
    }

    expect(parseAndMapMetadata(raw)).toEqual({
      isbn: "9788711234567",
      materialType: "ebook",
    })
  })

  it("maps an audiobook material", () => {
    const raw = {
      materials: [{ isbn: "9788711234567", material_type: "audiobook" }],
    }

    expect(parseAndMapMetadata(raw)).toEqual({
      isbn: "9788711234567",
      materialType: "audiobook",
    })
  })

  it("returns undefined when no materials were resolved", () => {
    expect(parseAndMapMetadata({ materials: [] })).toBeUndefined()
  })

  it("ignores additional fields on the upstream material object", () => {
    const raw = {
      materials: [
        {
          isbn: "9788711234567",
          material_type: "ebook",
          title: "Some title",
          duration_seconds: 3600,
          publisher: "Some publisher",
        },
      ],
    }

    expect(parseAndMapMetadata(raw)).toEqual({
      isbn: "9788711234567",
      materialType: "ebook",
    })
  })

  it("throws on an unexpected material_type (e.g. paper_book)", () => {
    expect(() =>
      parseAndMapMetadata({
        materials: [{ isbn: "9788711234567", material_type: "paper_book" }],
      })
    ).toThrow()
  })

  it("throws when isbn is the wrong type", () => {
    expect(() =>
      parseAndMapMetadata({
        materials: [{ isbn: 42, material_type: "ebook" }],
      })
    ).toThrow()
  })

  it("throws when the materials array is missing", () => {
    expect(() => parseAndMapMetadata({})).toThrow()
  })

  it("throws on a non-object response", () => {
    expect(() => parseAndMapMetadata(null)).toThrow()
    expect(() => parseAndMapMetadata("materials")).toThrow()
    expect(() => parseAndMapMetadata(42)).toThrow()
  })
})
