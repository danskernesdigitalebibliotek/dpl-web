"use client"

import { useLoans, useReservations } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import PhysicalLoanSlider, {
  PhysicalLoanSliderSkeleton,
} from "@/components/shared/physicalLoanSlider/PhysicalLoanSlider"
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
  const { data: loans, isLoading: isLoadingLoans } = useLoans()
  const { data: reservations, isLoading: isLoadingReservations } = useReservations()

  const fausts = shelfRecordIds(loans ?? [], reservations ?? [])
  const { data: dataManifestations, isLoading: isLoadingManifestations } =
    useGetManifestationsByFaustQuery({ faust: fausts }, { enabled: fausts.length > 0 })

  const loanItems = buildPhysicalLoanItems(loans ?? [], dataManifestations?.manifestations)
  const reservationItems = buildReservationItems(
    reservations ?? [],
    dataManifestations?.manifestations
  )

  return (
    <div className={cn("col-span-full", className)}>
      {(isLoadingLoans || isLoadingReservations || isLoadingManifestations) && (
        <PhysicalLoanSliderSkeleton />
      )}
      {!isLoadingLoans && !isLoadingReservations && !isLoadingManifestations && loans && (
        <PhysicalLoanSlider items={loanItems} reservationItems={reservationItems} />
      )}
    </div>
  )
}

export default PhysicalLoans
