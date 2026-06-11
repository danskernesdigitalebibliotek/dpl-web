import {
  type CreateReservationInput,
  type CreateReservationResult,
  createReservation,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { cookies } from "next/headers"

import { getBearerTokenServerSide } from "./bearer-token"
import { getServiceLayerConfig } from "./service-layer"

// Resolves the FBS auth header from cookies and hands off to the service-layer.
// Returns null when there's no usable token so callers can surface a "not logged
// in" outcome instead of throwing.
export const createReservationServerSide = async (
  input: CreateReservationInput
): Promise<CreateReservationResult | null> => {
  const cookieStore = await cookies()
  const token = await getBearerTokenServerSide("fbs", cookieStore)
  if (!token) return null
  return createReservation(getServiceLayerConfig(token), input)
}
