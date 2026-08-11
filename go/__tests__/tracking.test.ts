import { beforeEach, describe, expect, test, vi } from "vitest"

import {
  clearPageStatistics,
  collectPageStatistics,
  sendPageUpdate,
  trackEvent,
} from "@/lib/tracking/mapp"
import { statistics } from "@/lib/tracking/statistics"

describe("Mapp tracking primitives", () => {
  beforeEach(() => {
    // eslint-disable-next-line no-underscore-dangle
    window._ti = undefined
    window.wts = undefined
    vi.restoreAllMocks()
  })

  describe("registry", () => {
    test("reuses the same parameter name/id as the React apps for OSS", () => {
      expect(statistics.searchQuery).toEqual({ id: 10, name: "OSS", parameterName: "OSS" })
    })
  })

  describe("collectPageStatistics", () => {
    test("writes the parameter onto window._ti", () => {
      collectPageStatistics(statistics.searchQuery, "harry potter")

      // eslint-disable-next-line no-underscore-dangle
      expect(window._ti?.[statistics.searchQuery.parameterName]).toBe("harry potter")
    })

    test("ignores entries with an empty parameterName (event-only)", () => {
      collectPageStatistics({ id: 99, name: "event-only", parameterName: "" }, "x")

      // eslint-disable-next-line no-underscore-dangle
      expect(window._ti).toBeUndefined()
    })
  })

  describe("clearPageStatistics", () => {
    test("removes the parameter but preserves other collected params", () => {
      // eslint-disable-next-line no-underscore-dangle
      window._ti = { p_mat_type: "bog" }
      collectPageStatistics(statistics.searchQuery, "dune")

      clearPageStatistics(statistics.searchQuery)

      // eslint-disable-next-line no-underscore-dangle
      expect(window._ti?.[statistics.searchQuery.parameterName]).toBeUndefined()
      // eslint-disable-next-line no-underscore-dangle
      expect(window._ti?.p_mat_type).toBe("bog")
    })
  })

  describe("trackEvent", () => {
    test("pushes a click event in the React-compatible shape", () => {
      window.wts = []

      trackEvent("click", statistics.searchQuery, "870970-basis:137757451")

      expect(window.wts).toEqual([
        [
          "send",
          "click",
          {
            linkId: "OSS",
            customClickParameter: { 10: "870970-basis:137757451" },
          },
        ],
      ])
    })

    test("resolves even when Mapp is not configured (no window.wts)", async () => {
      await expect(trackEvent("click", statistics.searchQuery, "x")).resolves.toBeUndefined()
    })
  })

  describe("sendPageUpdate", () => {
    test("pushes a pageupdate when Mapp is configured", () => {
      window.wts = []

      sendPageUpdate()

      expect(window.wts).toEqual([["send", "pageupdate"]])
    })

    test("no-ops when Mapp is not configured", () => {
      sendPageUpdate()

      expect(window.wts).toBeUndefined()
    })
  })
})
