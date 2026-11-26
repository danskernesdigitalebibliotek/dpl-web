import { describe, expect, it, vi } from "vitest"

import { digitalLoanDecisionQueryKey } from "../queries/digital-loan-decision"
import type { LoanDecision, ServiceLayerConfig } from "../types"
import { useDigitalLoanDecisions } from "./useDigitalLoanDecisions"

const askedFor = vi.hoisted(() => ({ current: [] as (readonly unknown[])[] }))

vi.mock("@tanstack/react-query", async importOriginal => ({
  ...(await importOriginal<object>()),
  useQueries: ({ queries }: { queries: { queryKey: readonly unknown[] }[] }) => {
    askedFor.current = queries.map(query => query.queryKey)
    return queries.map((_, index) => ({
      data: { status: "loanable", loanProvider: `provider-${index}` } as LoanDecision,
      isLoading: false,
      isError: false,
    }))
  },
}))

vi.mock("../context/ServiceLayerContext", () => ({
  useServiceLayerConfig: (): ServiceLayerConfig => ({
    getBaseUrl: () => "https://biblio.example",
    getAuthHeader: () => "Bearer abc",
  }),
}))

describe("useDigitalLoanDecisions", () => {
  it("asks about a material id given more than once only once", () => {
    const { decisions } = useDigitalLoanDecisions(["1", "2", "1"])

    expect(askedFor.current).toEqual([
      digitalLoanDecisionQueryKey("1"),
      digitalLoanDecisionQueryKey("2"),
    ])
    expect(decisions["1"]?.loanProvider).toBe("provider-0")
    expect(decisions["2"]?.loanProvider).toBe("provider-1")
  })
})
