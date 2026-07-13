import {
  ServiceLayerProvider,
  loansQueryKey,
  useRenewLoans,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const config = {
  getBaseUrl: () => "https://fbs.example",
  getAuthHeader: () => "Bearer test-token",
}

const renewedResponse = [
  {
    renewalStatus: ["renewed"],
    loanDetails: { loanId: 42, recordId: "42", dueDate: "2026-08-16" },
  },
]

const seededLoan = {
  loanId: 42,
  recordId: "42",
  dueDate: "2026-07-16",
  loanDate: "2026-06-16",
  materialItemNumber: "5001234567",
  isRenewable: true,
}

describe("useRenewLoans loans-cache invalidation", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => renewedResponse,
      } as Response)
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const setup = (options?: Parameters<typeof useRenewLoans>[0]) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    // Seed the loans cache so there is a concrete query whose invalidation
    // (isInvalidated) we can observe after a renewal.
    queryClient.setQueryData(loansQueryKey(), [seededLoan])

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ServiceLayerProvider config={config}>{children}</ServiceLayerProvider>
      </QueryClientProvider>
    )
    const rendered = renderHook(() => useRenewLoans(options), { wrapper })
    return { queryClient, ...rendered }
  }

  it("invalidates the loans query after a renewal (control)", async () => {
    const { queryClient, result } = setup()

    result.current.mutate([42])

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryState(loansQueryKey())?.isInvalidated).toBe(true)
  })

  // The hook composes its own onSuccess (invalidate + delegate to
  // options.onSuccess) but then spreads `...options` AFTER it, so a hook-level
  // onSuccess replaces the composed handler entirely — the delegation call
  // inside it proves composition was intended.
  it("still invalidates the loans query when the consumer passes a hook-level onSuccess", async () => {
    const consumerOnSuccess = vi.fn()
    const { queryClient, result } = setup({ onSuccess: consumerOnSuccess })

    result.current.mutate([42])

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(consumerOnSuccess).toHaveBeenCalledTimes(1)
    // Regression guard: `...options` used to be spread AFTER the composed
    // onSuccess, so a hook-level onSuccess replaced it and the loans query
    // was never invalidated — leaving stale dueDate/isRenewable in the UI.
    expect(queryClient.getQueryState(loansQueryKey())?.isInvalidated).toBe(true)
  })
})
