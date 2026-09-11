import { z } from "zod"

import type { LoanDecision, LoanRequestResult } from "../../../src/types"
import { LoanProviderSchema, LoanSchema, mapLoan } from "./loan.mapper"

const LoanDecisionSchema = z.object({
  status: z.enum([
    "loanable",
    "reservable",
    "wishable",
    "unavailable",
    "monthly_limit_exceeded",
    "concurrent_limit_exceeded",
    "no_valid_credentials",
    "lending_blocked",
  ]),
  // Optional by contract: "the provider selected for the attempted loan, when
  // available" - absent when no provider could be picked at all.
  loan_provider: LoanProviderSchema.optional(),
  unavailable_reason: z.string().optional(),
  lending_block_reason: z.string().optional(),
})

// Asking for a loan or a reservation is answered with the same decision as
// asking whether one is possible, plus the created loan when the request
// produced one.
const LoanRequestResultSchema = LoanDecisionSchema.extend({
  loan: LoanSchema.optional(),
})

// The contract lets a 2xx body be the adapter's error envelope instead of the
// answer. Prefer its human-readable message over a zod error that hides it.
const ApiErrorSchema = z.object({ message: z.string() })

function parseOrThrowAdapterMessage<T extends z.ZodTypeAny>(schema: T, raw: unknown): z.infer<T> {
  const parsed = schema.safeParse(raw)
  if (parsed.success) {
    return parsed.data
  }
  const error = ApiErrorSchema.safeParse(raw)
  if (error.success) {
    throw new Error(`Biblio adapter error: ${error.data.message}`)
  }
  throw parsed.error
}

function mapDecision(parsed: z.infer<typeof LoanDecisionSchema>): LoanDecision {
  return {
    status: parsed.status,
    loanProvider: parsed.loan_provider,
    unavailableReason: parsed.unavailable_reason,
    lendingBlockReason: parsed.lending_block_reason,
  }
}

export function parseAndMapLoanDecision(raw: unknown): LoanDecision {
  return mapDecision(parseOrThrowAdapterMessage(LoanDecisionSchema, raw))
}

export function parseAndMapLoanRequestResult(raw: unknown): LoanRequestResult {
  const parsed = parseOrThrowAdapterMessage(LoanRequestResultSchema, raw)
  return {
    ...mapDecision(parsed),
    loan: parsed.loan ? mapLoan(parsed.loan) : undefined,
  }
}
