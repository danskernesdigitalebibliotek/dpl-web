"use client"

import type { UseMutationResult } from "@tanstack/react-query"

import { acceptDigitalOffer } from "../digital-reservations"
import { type DigitalMutationOptions, useDigitalMutation } from "./internal"

type AcceptOfferResult = { success: boolean; loanId?: string }

/**
 * Accept a reservation offer as a loan.
 *
 * Publizon has no explicit redeem step - a redeemable reservation simply shows
 * the loan button, and creating the loan redeems it. Biblio separates the two,
 * so a material the user already holds an offer for is accepted here rather
 * than borrowed through createLoan.
 */
export const useDigitalAcceptOffer = (
  options?: DigitalMutationOptions<AcceptOfferResult>
): UseMutationResult<AcceptOfferResult, Error, string> =>
  useDigitalMutation(acceptDigitalOffer, options)
