import { describe, expect, test } from "vitest"

import { getWorkTeaserProps } from "@/components/shared/workTeaser/helper"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"

const manifestation = (pid: string, code: string, year: number | null, publizon = true) => ({
  pid,
  materialTypes: [{ materialTypeSpecific: { code } }],
  identifiers: publizon ? [{ type: "PUBLIZON", value: pid }] : [],
  edition: year === null ? null : { publicationYear: { year } },
  cover: { large: { url: `cover-${pid}` } },
})

const work = (manifestations: ReturnType<typeof manifestation>[]) =>
  ({
    workId: "work-of:1",
    titles: { full: ["Titel"] },
    creators: [],
    manifestations: { all: manifestations, bestRepresentation: manifestations[0] },
  }) as unknown as WorkTeaserSearchPageFragment

describe("getWorkTeaserProps", () => {
  test("passes on every manifestation of an allowed type, not only the newest per type", () => {
    const { manifestations } = getWorkTeaserProps(
      work([
        manifestation("ebook-2015", "EBOOK", 2015),
        manifestation("ebook-2022", "EBOOK", 2022),
        manifestation("book-2020", "BOOK", 2020),
        manifestation("dvd", "MOVIE", 2020),
      ])
    )

    expect(manifestations.map(({ pid }) => pid)).toEqual(["ebook-2022", "ebook-2015", "book-2020"])
  })

  test("orders by type priority, then newest first within a type", () => {
    const { manifestations } = getWorkTeaserProps(
      work([
        manifestation("book-2010", "BOOK", 2010),
        manifestation("audio-2018", "AUDIO_BOOK_ONLINE", 2018),
        manifestation("book-2021", "BOOK", 2021),
        manifestation("ebook-none", "EBOOK", null),
        manifestation("ebook-2019", "EBOOK", 2019),
      ])
    )

    expect(manifestations.map(({ pid }) => pid)).toEqual([
      "ebook-2019",
      "ebook-none",
      "audio-2018",
      "book-2021",
      "book-2010",
    ])
  })

  test("links to the e-book type and lists its manifestations newest first", () => {
    const { linkedManifestations, url } = getWorkTeaserProps(
      work([
        manifestation("book-2023", "BOOK", 2023),
        manifestation("ebook-2015", "EBOOK", 2015),
        manifestation("electronic-2018", "BOOK_ELECTRONIC", 2018),
        manifestation("ebook-2022", "EBOOK", 2022),
      ])
    )

    expect(url).toContain("type=EBOOK")
    expect(linkedManifestations.map(({ pid }) => pid)).toEqual([
      "ebook-2022",
      "electronic-2018",
      "ebook-2015",
    ])
  })

  test("lists no linked manifestations when no type can be linked", () => {
    const { linkedManifestations, url } = getWorkTeaserProps(
      work([manifestation("dvd", "MOVIE", 2020)])
    )

    expect(url).toBe("")
    expect(linkedManifestations).toEqual([])
  })
})
