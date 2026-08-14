"use client"

import { type Reservation, useReservations } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { findReservationByRecordId } from "@/lib/helpers/helper.reservation"
import { pidToFaust } from "@/lib/helpers/ids"

// The patron's reservation for a manifestation, if any — matched on the
// FAUST record id. The service-layer hook is patron-gated, so nothing fires
// for Unilogin or anonymous sessions.
export const useExistingReservation = (pid: string): Reservation | undefined => {
  const { data: reservations } = useReservations()
  return findReservationByRecordId(reservations, pidToFaust(pid))
}
