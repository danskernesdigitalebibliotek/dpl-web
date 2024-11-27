import { ReadonlyURLSearchParams } from "next/navigation"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getFacetsForSearchRequest,
  getSearchQueryArguments,
} from "@/components/pages/searchPageLayout/helper"
import { getFacetMachineNames, getFacetTranslation } from "@/components/shared/searchFilters/helper"
import goConfig from "@/lib/config/goConfig"
import { FacetFieldEnum } from "@/lib/graphql/generated/fbi/graphql"

vi.mock(import("@/lib/config/goConfig"), async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: vi.fn(),
  }
})

export const facets = {
  [FacetFieldEnum.Materialtypesgeneral]: {
    filter: "materialTypesGeneral",
    translation: "Type",
  },
  [FacetFieldEnum.Mainlanguages]: {
    filter: "mainLanguages",
    translation: "Sprog",
  },
  [FacetFieldEnum.Age]: { filter: "age", translation: "Alder" },
  [FacetFieldEnum.Lix]: { filter: "lixRange", translation: "Lix" },
  [FacetFieldEnum.Subjects]: { filter: "subjects", translation: "Emne" },
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

  it("getFacetsForSearchRequest should return an object with facet terms grouped by facet machine names", () => {
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

    const result = getFacetsForSearchRequest(searchParams as ReadonlyURLSearchParams)
    expect(result).toStrictEqual(facetFilters)
  })

  it("getFacetTranslation should give a translated facet when given a facet machine name", () => {
    // @ts-ignore
    const translation = getFacetTranslation("LIX")
    expect(translation).toBe("Lix")
  })
})
