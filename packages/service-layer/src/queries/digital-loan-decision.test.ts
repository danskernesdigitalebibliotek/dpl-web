import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { BiblioHttpError } from "../../biblio/src"
import { mockJsonResponse } from "../test-utils"
import type { ServiceLayerConfig } from "../types"
import { digitalLoanDecisionQuery } from "./digital-loan-decision"

const config: ServiceLayerConfig = {
  getBaseUrl: () => "https://biblio.example",
  getAuthHeader: () => "Bearer abc",
}

const failure = (status: number) =>
  new BiblioHttpError("GET", "/v1/loans/can-loan", status, "Something")

const options = digitalLoanDecisionQuery(config, "9788758855752")
const throwsToBoundary = options.throwOnError as (error: Error) => boolean
const retry = options.retry as (failureCount: number, error: Error) => boolean
const retries = (error: Error) => retry(0, error)
const refetchOnFocus = options.refetchOnWindowFocus as (query: unknown) => boolean
const refetchesOnFocusAfter = (error: Error) => refetchOnFocus({ state: { error } })
const retryOnMount = options.retryOnMount as (query: unknown) => boolean
const retriesOnMountAfter = (error: Error) => retryOnMount({ state: { error } })
const setupError = new Error("Service layer requests require a token.")

let logged: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  logged = vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("digitalLoanDecisionQuery", () => {
  it.each([403, 500, 503])("Keeps a %s off the error boundary", status => {
    expect(throwsToBoundary(failure(status))).toBe(false)
  })

  it("Keeps a network failure off the error boundary", () => {
    expect(throwsToBoundary(new TypeError("Failed to fetch"))).toBe(false)
  })

  it("Sends an expired session to the error boundary", () => {
    expect(throwsToBoundary(failure(401))).toBe(true)
  })

  it("Sends broken setup to the error boundary", () => {
    expect(throwsToBoundary(setupError)).toBe(true)
  })

  it.each([400, 403])("Does not ask again after a %s", status => {
    expect(retries(failure(status))).toBe(false)
  })

  it("Asks again after a server error", () => {
    expect(retries(failure(503))).toBe(true)
  })

  it("Asks again after a network failure", () => {
    expect(retries(new TypeError("Failed to fetch"))).toBe(true)
  })

  it("Does not ask again after broken setup", () => {
    expect(retries(setupError)).toBe(false)
  })

  it("Does not ask again on focus after a 403", () => {
    expect(refetchesOnFocusAfter(failure(403))).toBe(false)
  })

  it("Asks again on focus after a server error", () => {
    expect(refetchesOnFocusAfter(failure(503))).toBe(true)
  })

  it("Does not ask again on mount after a 403", () => {
    expect(retriesOnMountAfter(failure(403))).toBe(false)
  })

  it("Asks again on mount after a server error", () => {
    expect(retriesOnMountAfter(failure(503))).toBe(true)
  })

  it("Logs a server error once, when it stops asking", () => {
    const error = failure(503)
    ;[0, 1, 2, 3].forEach(failureCount => retry(failureCount, error))

    expect(logged).toHaveBeenCalledTimes(1)
  })

  it("Logs a client error at once", () => {
    retries(failure(403))

    expect(logged).toHaveBeenCalledTimes(1)
  })

  it("Leaves what the error boundary shows unlogged", () => {
    retries(failure(401))

    expect(logged).not.toHaveBeenCalled()
  })
})

describe("digitalLoanDecisionQuery fetching", () => {
  const fetchDecision = options.queryFn as () => Promise<unknown>

  it("Answers null without logging for a material the adapter does not know", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({}, 404)))

    await expect(fetchDecision()).resolves.toBeNull()
    expect(logged).not.toHaveBeenCalled()
  })
})
