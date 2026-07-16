"use client"

import { useLoans, useReservations } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import PhysicalLoanSlider, {
  PhysicalLoanItem,
  PhysicalLoanSliderSkeleton,
} from "@/app/(pages)/user/profile/PhysicalLoanSlider"
import { type ReservationItem } from "@/app/(pages)/user/profile/ReservationsModal"
import { useGetManifestationsByFaustQuery } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { pidToFaust } from "@/lib/helpers/ids"

export type PhysicalLoansProps = {
  className?: string
}

const PhysicalLoans = ({ className }: PhysicalLoansProps) => {
  const { data: loans, isLoading: isLoadingLoans } = useLoans()
  const { data: reservations, isLoading: isLoadingReservations } = useReservations()
  // Most urgent first: overdue loans, then loans closest to their due date.
  const sortedLoans = [...(loans ?? [])].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )
  const loanFausts = sortedLoans.map(loan => loan.recordId)
  // One exact lookup covers both the loans and the reservations overview —
  // the complex search index does not resolve term.faust reliably.
  const fausts = [...new Set([...loanFausts, ...(reservations ?? []).map(r => r.recordId)])]

  const { data: dataManifestations, isLoading: isLoadingManifestations } =
    useGetManifestationsByFaustQuery({ faust: fausts }, { enabled: fausts.length > 0 })

  // Pair each loan/reservation with the owning work + the exact manifestation
  // it points at, by matching the FBS record id (FAUST) against the pid.
  // Materials exclusively for adults are dropped: GO is the children's site,
  // and the FBS account also holds loans/reservations made on the adult site.
  const findWorkAndManifestation = (recordId: string) => {
    const entry = dataManifestations?.manifestations.find(
      entry => entry && pidToFaust(entry.pid) === recordId
    )
    if (!entry) return null
    const audienceCodes = entry.audience?.childrenOrAdults.map(({ code }) => code) ?? []
    const isAdultsOnly = audienceCodes.length > 0 && audienceCodes.every(c => c === "FOR_ADULTS")
    if (isAdultsOnly) return null
    const work = entry.ownerWork
    const manifestation = work.manifestations.all.find(
      manifestation => pidToFaust(manifestation.pid) === recordId
    )
    return manifestation ? { work, manifestation } : null
  }

  const loanItems = sortedLoans.reduce<PhysicalLoanItem[]>((acc, loan) => {
    const match = findWorkAndManifestation(loan.recordId)
    return match ? [...acc, { loan, ...match }] : acc
  }, [])

  // Ready-for-pickup reservations first, then shortest queue first;
  // unknown queue positions go last.
  const sortedReservations = [...(reservations ?? [])].sort((a, b) => {
    const aReady = a.state === "readyForPickup"
    const bReady = b.state === "readyForPickup"
    if (aReady !== bReady) return aReady ? -1 : 1
    return (
      (a.numberInQueue ?? Number.MAX_SAFE_INTEGER) - (b.numberInQueue ?? Number.MAX_SAFE_INTEGER)
    )
  })
  const reservationItems = sortedReservations.reduce<ReservationItem[]>((acc, reservation) => {
    const match = findWorkAndManifestation(reservation.recordId)
    return match ? [...acc, { reservation, ...match }] : acc
  }, [])

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
