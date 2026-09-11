"use client"

import type { UseMutationResult } from "@tanstack/react-query"

import { createDigitalLoan } from "../digital-loans"
import type { LoanRequestResult } from "../types"
import { type DigitalMutationOptions, useDigitalMutation } from "./internal"

/**
 * Create a digital loan through the Biblio adapter.
 *
 * The adapter can accept the request without creating a loan - an exceeded
 * quota, say - so callers must check `result.loan` rather than treat a
 * resolved promise as success.
 *
 * Callers gate on the feature flag: new loans belong to Biblio only once the
 * library has switched to it.
 */
export const useDigitalCreateLoan = (
  options?: DigitalMutationOptions<LoanRequestResult>
): UseMutationResult<LoanRequestResult, Error, string> =>
  useDigitalMutation(createDigitalLoan, options)
