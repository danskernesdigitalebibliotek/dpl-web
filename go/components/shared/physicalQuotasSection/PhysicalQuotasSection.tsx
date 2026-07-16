"use client"

import { differenceInDays } from "date-fns"
import React from "react"

import { cyKeys } from "@/cypress/support/constants"
import useLoanThresholds from "@/hooks/useLoanThresholds"
import { type PhysicalLoanItem, type ReservationItem } from "@/lib/helpers/helper.patron"
import { openModal } from "@/store/modal.store"

export type PhysicalQuotasSectionProps = {
  // Counts and modals both use the paired items: pairing resolves records
  // through FBI and filters out adult-only materials, which the raw FBS
  // data cannot distinguish.
  loanItems: PhysicalLoanItem[]
  reservationItems: ReservationItem[]
}

const StatBox = ({ count, label }: { count: number; label: string }) => (
  <div
    className="bg-background-overlay flex flex-1 flex-col items-center justify-center gap-2
      rounded-sm p-6 text-center md:min-h-36">
    <p className="text-typo-heading-3">{count}</p>
    <p className="text-typo-subtitle-sm opacity-70">{label}</p>
  </div>
)

const OverviewCard = ({
  title,
  onViewAll,
  viewAllDataCy,
  children,
}: {
  title: string
  onViewAll: () => void
  viewAllDataCy: string
  children: React.ReactNode
}) => (
  <div
    className="bg-background duration-dark-mode p-grid-edge rounded-base flex-1 space-y-4
      transition-all md:p-8">
    <div className="flex items-center justify-between">
      <h3 className="text-typo-subtitle-sm opacity-70">{title}</h3>
      <button
        type="button"
        onClick={onViewAll}
        // eslint-disable-next-line no-restricted-syntax -- viewAllDataCy comes from cyKeys at call site
        data-cy={viewAllDataCy}
        className="text-typo-link focus-visible cursor-pointer underline">
        Vis alle
      </button>
    </div>
    <div className="flex w-full flex-row gap-4 md:gap-6">{children}</div>
  </div>
)

// Overview under the physical loan slider: loan counts and reservation
// counts, each with a "Vis alle" opening the matching modal.
const PhysicalQuotasSection = ({ loanItems, reservationItems }: PhysicalQuotasSectionProps) => {
  const { warning } = useLoanThresholds()

  const dueSoonCount = loanItems.filter(
    ({ loan }) => differenceInDays(new Date(loan.dueDate), new Date()) <= warning
  ).length
  const readyCount = reservationItems.filter(
    ({ reservation }) => reservation.state === "readyForPickup"
  ).length
  const queuedCount = reservationItems.length - readyCount

  return (
    <div className="col-span-full">
      <div className="gap-grid-edge flex w-full flex-col md:gap-6 lg:flex-row">
        <OverviewCard
          title="Mine lån"
          onViewAll={() => openModal("PhysicalLoansModal", { items: loanItems })}
          viewAllDataCy={cyKeys["view-all-physical-loans-button"]}>
          <StatBox count={loanItems.length} label="Lånte bøger" />
          <StatBox count={dueSoonCount} label="Skal afleveres" />
        </OverviewCard>
        <OverviewCard
          title="Mine reserveringer"
          onViewAll={() => openModal("ReservationsModal", { items: reservationItems })}
          viewAllDataCy={cyKeys["view-all-reservations-button"]}>
          <StatBox count={readyCount} label="Klar til afhentning" />
          <StatBox count={queuedCount} label="I kø" />
        </OverviewCard>
      </div>
    </div>
  )
}

export default PhysicalQuotasSection
