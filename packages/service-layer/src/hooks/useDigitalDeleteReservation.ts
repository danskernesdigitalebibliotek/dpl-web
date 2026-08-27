"use client"

import type { UseMutationResult } from "@tanstack/react-query"

import { deleteDigitalReservation } from "../biblio"
import { type DigitalMutationOptions, useDigitalMutation } from "./internal"

/**
 * Cancel a reservation in the Biblio adapter, by the reservation's own id -
 * Publizon cancels by material identifier.
 *
 * A request the adapter accepted without removing anything rejects rather than
 * resolves; see deleteDigitalReservation for why.
 */
export const useDigitalDeleteReservation = (
  options?: DigitalMutationOptions<void>
): UseMutationResult<void, Error, string> => useDigitalMutation(deleteDigitalReservation, options)
