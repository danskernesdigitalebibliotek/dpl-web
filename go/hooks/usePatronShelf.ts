"use client"

import { useLoans, useReservations } from "@danskernesdigitalebibliotek/dpl-service-layer"

import useSession from "@/hooks/useSession"
import { useGetManifestationsByFaustQuery } from "@/lib/graphql/generated/fbi/graphql"
import {
  type PhysicalLoanItem,
  type ReservationItem,
  buildPhysicalLoanItems,
  buildReservationItems,
  shelfRecordIds,
} from "@/lib/helpers/helper.patron"
import { type TSessionData } from "@/lib/session/session"

type PatronShelf = {
  // Paired with FBI works — resolves records and filters out adult-only
  // materials, which the raw FBS data cannot distinguish.
  loanItems: PhysicalLoanItem[]
  reservationItems: ReservationItem[]
  // Exposed so consumers don't fetch the session a second time.
  session: TSessionData | null
  // FBS requires a library login; false for Unilogin and anonymous sessions.
  isLibraryLogin: boolean
  isLoading: boolean
  isError: boolean
}

// The patron's physical shelf: FBS loans and reservations paired with their
// FBI works. The single assembly shared by every consumer — the FAUST list
// is part of the react-query cache key, so copies that drift would cause
// silent cache misses. The queries wait for the session, so sessions
// without FBS access never fire doomed requests.
const usePatronShelf = (): PatronShelf => {
  const { session, isLoading: isLoadingSession } = useSession()
  const isLibraryLogin = session?.type === "adgangsplatformen"
  const {
    data: loans,
    isLoading: isLoadingLoans,
    isError: isErrorLoans,
  } = useLoans({ enabled: isLibraryLogin })
  const {
    data: reservations,
    isLoading: isLoadingReservations,
    isError: isErrorReservations,
  } = useReservations({ enabled: isLibraryLogin })

  const fausts = shelfRecordIds(loans ?? [], reservations ?? [])
  const {
    data: dataManifestations,
    isLoading: isLoadingManifestations,
    isError: isErrorManifestations,
  } = useGetManifestationsByFaustQuery({ faust: fausts }, { enabled: fausts.length > 0 })

  return {
    loanItems: buildPhysicalLoanItems(loans ?? [], dataManifestations?.manifestations),
    reservationItems: buildReservationItems(reservations ?? [], dataManifestations?.manifestations),
    session,
    isLibraryLogin,
    isLoading:
      isLoadingSession || isLoadingLoans || isLoadingReservations || isLoadingManifestations,
    isError: isErrorLoans || isErrorReservations || isErrorManifestations,
  }
}

export default usePatronShelf
