"use client"

import { useLoans, useReservations } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import PhysicalLoanSlider, {
  PhysicalLoanSliderSkeleton,
} from "@/components/shared/physicalLoanSlider/PhysicalLoanSlider"
import PhysicalLoansUniloginTeaser from "@/components/shared/physicalLoans/PhysicalLoansUniloginTeaser"
import useSession from "@/hooks/useSession"
import { useGetManifestationsByFaustQuery } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import {
  buildPhysicalLoanItems,
  buildReservationItems,
  shelfRecordIds,
} from "@/lib/helpers/helper.patron"

export type PhysicalLoansProps = {
  className?: string
}

const PhysicalLoans = ({ className }: PhysicalLoansProps) => {
  const { session, isLoading: isLoadingSession } = useSession()
  // FBS requires a library login; the queries wait for the session so
  // Unilogin (and still-loading) sessions never fire doomed FBS requests.
  const isLibraryLogin = session?.type === "adgangsplatformen"
  const { data: loans, isLoading: isLoadingLoans } = useLoans({ enabled: isLibraryLogin })
  const { data: reservations, isLoading: isLoadingReservations } = useReservations({
    enabled: isLibraryLogin,
  })

  const fausts = shelfRecordIds(loans ?? [], reservations ?? [])
  const { data: dataManifestations, isLoading: isLoadingManifestations } =
    useGetManifestationsByFaustQuery({ faust: fausts }, { enabled: fausts.length > 0 })

  const loanItems = buildPhysicalLoanItems(loans ?? [], dataManifestations?.manifestations)
  const reservationItems = buildReservationItems(
    reservations ?? [],
    dataManifestations?.manifestations
  )

  // FBS is only available with a library login.
  if (session?.type === "unilogin") {
    return <PhysicalLoansUniloginTeaser className={className} />
  }

  const isLoading =
    isLoadingSession || isLoadingLoans || isLoadingReservations || isLoadingManifestations

  return (
    <div className={cn("col-span-full", className)}>
      {isLoading && <PhysicalLoanSliderSkeleton />}
      {!isLoading && loans && (
        <PhysicalLoanSlider items={loanItems} reservationItems={reservationItems} />
      )}
    </div>
  )
}

export default PhysicalLoans
