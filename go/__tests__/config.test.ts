import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import MissingConfigurationError from "@/lib/config/errors/MissingConfigurationError"
import goConfig from "@/lib/config/goConfig"
import useGoConfig from "@/lib/config/useGoConfig"

describe("Config test suite", () => {
  test("That an error is thrown if we ask for unknown config", async () => {
    // @ts-ignore
    expect(() => goConfig("unknown.thingy")).toThrowError(MissingConfigurationError)
  })

  test("That the client hook returns configuration as expected", async () => {
    const { result } = renderHook(() => useGoConfig(["search.item.limit", "search.branch.ids"]))

    await waitFor(() => {
      expect(result.current).not.toBeNull()
    })
    expect(result.current).toEqual({
      "search.item.limit": 12,
      "search.branch.ids": [
        "775120",
        "775122",
        "775144",
        "775167",
        "775146",
        "775168",
        "751010",
        "775147",
        "751032",
        "751031",
        "775126",
        "751030",
        "775149",
        "775127",
        "775160",
        "775162",
        "775140",
        "751009",
        "751029",
        "751027",
        "751026",
        "751025",
        "775133",
        "751024",
        "775100",
        "775170",
        "775150",
        "775130",
      ],
    })
  })
})
