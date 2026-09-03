import { z } from "zod"

import type { BiblioCanLoan, BiblioLoanResult } from "../../../src/types"
import { LoanProviderSchema, LoanSchema, mapLoan } from "./loan.mapper"

const CanLoanSchema = z.object({
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

// Creating a loan or a reservation returns the can-loan envelope plus the
// created loan when the operation resulted in one.
const LoanResultSchema = CanLoanSchema.extend({
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

export function parseAndMapCanLoan(raw: unknown): BiblioCanLoan {
  const parsed = parseOrThrowAdapterMessage(CanLoanSchema, raw)
  return {
    status: parsed.status,
    loanProvider: parsed.loan_provider,
    unavailableReason: parsed.unavailable_reason,
    lendingBlockReason: parsed.lending_block_reason,
  }
}

export function parseAndMapLoanResult(raw: unknown): BiblioLoanResult {
  const parsed = parseOrThrowAdapterMessage(LoanResultSchema, raw)
  return {
    status: parsed.status,
    loanProvider: parsed.loan_provider,
    unavailableReason: parsed.unavailable_reason,
    lendingBlockReason: parsed.lending_block_reason,
    loan: parsed.loan ? mapLoan(parsed.loan) : undefined,
  }
}
