"use client"

import type { UseMutationResult } from "@tanstack/react-query"

import { createDigitalReservation } from "../digital-reservations"
import type { LoanRequestResult } from "../types"
import { type DigitalMutationOptions, useDigitalMutation } from "./internal"

/**
 * Reserve a material through the Biblio adapter.
 *
 * Answers with the same envelope as a loan request: a decision status, and a
 * loan when the material turned out to be available right away.
 */
export const useDigitalCreateReservation = (
  options?: DigitalMutationOptions<LoanRequestResult>
): UseMutationResult<LoanRequestResult, Error, string> =>
  useDigitalMutation(createDigitalReservation, options)
