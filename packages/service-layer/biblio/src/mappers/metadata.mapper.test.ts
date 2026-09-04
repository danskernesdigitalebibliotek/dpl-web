import { describe, expect, it } from "vitest"

import { parseAndMapMetadata } from "./metadata.mapper"

// Everything the contract requires; tests override only the field they are about.
const upstreamMaterial = {
  isbn: "9788711234567",
  material_type: "ebook",
  title: "Din for en sommer",
  description: "En intens romance",
  publish_date: "2026-06-18T00:00:00.000Z",
  languages: ["dan"],
}

describe("parseAndMapMetadata", () => {
  it("maps an upstream material to a DigitalMaterial", () => {
    expect(parseAndMapMetadata({ materials: [upstreamMaterial] })).toEqual({
      isbn: "9788711234567",
      materialType: "ebook",
      title: "Din for en sommer",
      description: "En intens romance",
      publishDate: "2026-06-18T00:00:00.000Z",
      languages: ["dan"],
      authors: [],
    })
  })

  it("maps an audiobook material", () => {
    const raw = {
      materials: [{ ...upstreamMaterial, material_type: "audiobook" }],
    }

    expect(parseAndMapMetadata(raw)?.materialType).toBe("audiobook")
  })

  it("defaults the authors to an empty list, the one field not required", () => {
    expect(parseAndMapMetadata({ materials: [upstreamMaterial] })?.authors).toEqual([])
  })

  it("throws when a field the contract requires is missing", () => {
    const withoutTitle = { ...upstreamMaterial, title: undefined }

    expect(() => parseAndMapMetadata({ materials: [withoutTitle] })).toThrow()
  })

  it("carries the authors when the material has them", () => {
    const raw = {
      materials: [{ ...upstreamMaterial, author: ["Sherman, L."] }],
    }

    expect(parseAndMapMetadata(raw)?.authors).toEqual(["Sherman, L."])
  })

  it("returns undefined when no materials were resolved", () => {
    expect(parseAndMapMetadata({ materials: [] })).toBeUndefined()
  })

  it("ignores additional fields on the upstream material object", () => {
    const raw = {
      materials: [
        {
          ...upstreamMaterial,
          duration_seconds: 3600,
          publisher: "Some publisher",
          thema_codes: ["FA"],
        },
      ],
    }

    expect(parseAndMapMetadata(raw)).not.toHaveProperty("duration_seconds")
    expect(parseAndMapMetadata(raw)).not.toHaveProperty("publisher")
    expect(parseAndMapMetadata(raw)).not.toHaveProperty("thema_codes")
  })

  it("throws on an unexpected material_type (e.g. paper_book)", () => {
    expect(() =>
      parseAndMapMetadata({
        materials: [{ ...upstreamMaterial, material_type: "paper_book" }],
      })
    ).toThrow()
  })
})
