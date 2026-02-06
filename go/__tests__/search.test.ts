import { ReadonlyURLSearchParams } from "next/navigation"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getFacetMachineNames, getFacetTranslation } from "@/components/shared/searchFilters/helper"
import goConfig from "@/lib/config/goConfig"
import { FacetFieldEnum } from "@/lib/graphql/generated/fbi/graphql"
import { correctFacetNames, transformSearchParamsIntoFilters } from "@/lib/machines/search/helpers"

vi.mock(import("@/lib/config/goConfig"), async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: vi.fn(),
  }
})

type Facets = {
  [key in FacetFieldEnum]?: {
    filter: string
    translation: string
  }
}

export const facets: Facets = {
  MATERIALTYPESGENERAL: {
    filter: "materialTypesGeneral",
    translation: "Type",
  },
  MAINLANGUAGES: {
    filter: "mainLanguages",
    translation: "Sprog",
  },
  AGE: { filter: "age", translation: "Alder" },
  LIX: { filter: "lixRange", translation: "Lix" },
  SUBJECTS: { filter: "subjects", translation: "Emne" },
} as const

beforeEach(() => {
  // @ts-ignore
  ;(goConfig as jest.Mock).mockImplementation((key: string) => {
    if (key === "search.item.limit") {
      return 9 // Mocked return value for "search.item.limit"
    }
    if (key === "search.facets") {
      return facets
    }
    if (key === "search.branch.ids") {
      return ["11", "22", "33"]
    }

    return null
  })
})

describe("Facet functionality", () => {
  it("getMachineNames should return all the facet machine names", () => {
    // @ts-ignore
    goConfig.mockReturnValue(facets)
    const machineNames = getFacetMachineNames()
    expect(machineNames).toStrictEqual([
      "MATERIALTYPESGENERAL",
      "MAINLANGUAGES",
      "AGE",
      "LIX",
      "SUBJECTS",
    ])
  })

  it("transformSearchParamsIntoFilters should return an object with facet terms grouped by facet machine names", () => {
    const searchParams = new URLSearchParams()
    searchParams.append("materialTypesGeneral", "Book")
    searchParams.append("mainLanguages", "Danish")
    searchParams.append("mainLanguages", "English")
    searchParams.append("age", "Adult")
    searchParams.append("lixRange", "0-10")
    searchParams.append("lixRange", "11-20")
    searchParams.append("subjects", "Science")
    searchParams.append("subjects", "Math")

    const facetFilters = {
      materialTypesGeneral: ["Book"],
      mainLanguages: ["Danish", "English"],
      age: ["Adult"],
      lixRange: ["0-10", "11-20"],
      subjects: ["Science", "Math"],
    }

    const result = transformSearchParamsIntoFilters(searchParams as ReadonlyURLSearchParams)
    expect(result).toStrictEqual(facetFilters)
  })

  it("getFacetTranslation should give a translated facet when given a facet machine name", () => {
    const translation = getFacetTranslation("lixRange")
    expect(translation).toBe("Lix")
  })

  it("correctFacetNames should translate the facet names to input filter valid names", () => {
    const facets = [
      {
        name: "materialTypesGeneral",
        values: [
          {
            key: "podcasts",
            term: "podcasts",
            score: 179,
          },
        ],
      },
      {
        name: "mainLanguages",
        values: [
          {
            key: "dan",
            term: "Dansk",
            score: 238,
          },
        ],
      },
      {
        name: "age",
        values: [
          {
            key: "for 10 år",
            term: "for 10 år",
            score: 25,
          },
        ],
      },
      {
        name: "lix",
        values: [
          {
            key: "22",
            term: "22",
            score: 2,
          },
        ],
      },
      {
        name: "subjects",
        values: [
          {
            key: "magi",
            term: "magi",
            score: 192,
          },
        ],
      },
    ]

    const result = correctFacetNames(facets)

    expect(result).toStrictEqual([
      {
        name: "materialTypesGeneral",
        values: [
          {
            key: "podcasts",
            term: "podcasts",
            score: 179,
          },
        ],
      },
      {
        name: "mainLanguages",
        values: [
          {
            key: "dan",
            term: "Dansk",
            score: 238,
          },
        ],
      },
      {
        name: "age",
        values: [
          {
            key: "for 10 år",
            term: "for 10 år",
            score: 25,
          },
        ],
      },
      {
        name: "lixRange",
        values: [
          {
            key: "22",
            term: "22",
            score: 2,
          },
        ],
      },
      {
        name: "subjects",
        values: [
          {
            key: "magi",
            term: "magi",
            score: 192,
          },
        ],
      },
    ])
  })
})
