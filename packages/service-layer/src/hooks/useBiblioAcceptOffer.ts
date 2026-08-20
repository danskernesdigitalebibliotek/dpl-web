"use client"

import { type UseMutationOptions, type UseMutationResult, useMutation } from "@tanstack/react-query"

import { acceptBiblioReservationOffer } from "../biblio"
import { useServiceLayerConfig } from "../context/ServiceLayerContext"

type AcceptOfferResult = { success: boolean; loanId?: string }

type UseBiblioAcceptOfferOptions = Omit<
  UseMutationOptions<AcceptOfferResult, Error, string>,
  "mutationFn"
>

/**
 * Accept a reservation offer as a loan.
 *
 * Publizon has no explicit redeem step - a redeemable reservation simply shows
 * the loan button, and creating the loan redeems it. Biblio separates the two,
 * so a material the user already holds an offer for is accepted here rather
 * than borrowed through createLoan.
 */
export const useBiblioAcceptOffer = (
  options?: UseBiblioAcceptOfferOptions
): UseMutationResult<AcceptOfferResult, Error, string> => {
  const config = useServiceLayerConfig()
  return useMutation({
    mutationFn: offerId => acceptBiblioReservationOffer(config, offerId),
    ...options,
  })
}
