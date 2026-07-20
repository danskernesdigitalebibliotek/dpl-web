"use client"

import { useFees, useLoans, useReservations } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { differenceInDays } from "date-fns"
import React, { useEffect, useRef } from "react"

import { Button } from "@/components/shared/button/Button"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { cyKeys } from "@/cypress/support/constants"
import useLoanThresholds from "@/hooks/useLoanThresholds"
import useSession from "@/hooks/useSession"
import { useGetManifestationsByFaustQuery } from "@/lib/graphql/generated/fbi/graphql"
import { formatAmount, summarizeFees } from "@/lib/helpers/helper.fees"
import {
  buildPhysicalLoanItems,
  buildReservationItems,
  shelfRecordIds,
} from "@/lib/helpers/helper.patron"
import { openModal } from "@/store/modal.store"

const bookCount = (count: number) => (count === 1 ? "1 bog" : `${count} bøger`)

export type Notification = {
  key: string
  status: "error" | "warning" | "success"
  label: string
  title: string
  body?: string
  action?: { label: string; onClick: () => void }
}

const NotificationCard = ({ notification }: { notification: Notification }) => (
  <div
    data-cy={cyKeys["profile-notification"]}
    className="bg-background duration-dark-mode rounded-base flex flex-col items-start gap-4 p-6
      transition-all">
    <StatusLabel variant={notification.status}>{notification.label}</StatusLabel>
    <p className="text-typo-subtitle-lg">{notification.title}</p>
    {notification.body && (
      <p className="text-typo-body-sm text-foreground-muted">{notification.body}</p>
    )}
    {notification.action && (
      <Button
        size="sm"
        data-cy={cyKeys["profile-notification-button"]}
        className="mt-auto"
        onClick={notification.action.onClick}>
        {notification.action.label}
      </Button>
    )}
  </div>
)

// Important notifications on the profile page: unpaid fees, reservations
// ready for pickup and physical loans that are overdue or due soon. All of
// it is FBS data, so the section is hidden for Unilogin users.
const ProfileNotifications = () => {
  const { session } = useSession()
  const { warning } = useLoanThresholds()
  const { data: fees, isLoading: isLoadingFees } = useFees()
  const { data: loans, isLoading: isLoadingLoans } = useLoans()
  const { data: reservations, isLoading: isLoadingReservations } = useReservations()

  const fausts = shelfRecordIds(loans ?? [], reservations ?? [])
  const { data: dataManifestations, isLoading: isLoadingManifestations } =
    useGetManifestationsByFaustQuery({ faust: fausts }, { enabled: fausts.length > 0 })

  // FBS is only available with a library login.
  const isUnilogin = session?.type === "unilogin"
  const isLoading =
    isLoadingFees || isLoadingLoans || isLoadingReservations || isLoadingManifestations

  const {
    unpaidTotal,
    lateFeeTotal,
    lateMaterialCount,
    compensationTotal,
    compensationMaterialCount,
  } = summarizeFees(fees ?? [])

  // Overdue fees open the explainer modal, once per profile visit.
  const hasOpenedFeesModal = useRef(false)
  useEffect(() => {
    if (isLoading || isUnilogin || hasOpenedFeesModal.current || lateFeeTotal <= 0) return
    hasOpenedFeesModal.current = true
    openModal("FeesModal", { lateMaterialCount, lateFeeTotal })
  }, [isLoading, isUnilogin, lateFeeTotal, lateMaterialCount])

  if (isUnilogin) {
    return null
  }

  if (isLoading) {
    return <ProfileNotificationsSkeleton />
  }

  // The paired items both drive the counts and feed the modals: pairing
  // resolves records through FBI and filters out adult-only materials, which
  // the raw FBS data cannot distinguish.
  const loanItems = buildPhysicalLoanItems(loans ?? [], dataManifestations?.manifestations)
  const reservationItems = buildReservationItems(
    reservations ?? [],
    dataManifestations?.manifestations
  )

  const daysUntilDue = (dueDate: string) => differenceInDays(new Date(dueDate), new Date())
  const readyCount = reservationItems.filter(
    ({ reservation }) => reservation.state === "readyForPickup"
  ).length
  // Overdue means the due date itself has passed — a loan due today is still
  // on time and counts as due soon.
  const overdueCount = loanItems.filter(({ loan }) => daysUntilDue(loan.dueDate) < 0).length
  const dueSoonCount = loanItems.filter(({ loan }) => {
    const days = daysUntilDue(loan.dueDate)
    return days >= 0 && days <= warning
  }).length

  const openLoans = () => openModal("PhysicalLoansModal", { items: loanItems })
  const openReservations = () => openModal("ReservationsModal", { items: reservationItems })
  const openFees = () => openModal("FeesModal", { lateMaterialCount, lateFeeTotal })
  const openCompensation = () =>
    openModal("CompensationModal", { compensationMaterialCount, compensationTotal })

  const notifications: Notification[] = [
    ...(unpaidTotal > 0
      ? [
          {
            key: "fees",
            status: "error" as const,
            label: "Mangler betaling",
            title: `Du mangler at betale ${formatAmount(unpaidTotal)} kr.`,
            body: "Tag fat i en voksen for at få hjælp til at betale pengene.",
            // The modal only explains overdue fees; without any, the card
            // stands on its own.
            ...(lateFeeTotal > 0 ? { action: { label: "Vis gebyrer", onClick: openFees } } : {}),
          },
        ]
      : []),
    ...(compensationTotal > 0
      ? [
          {
            key: "compensation",
            status: "error" as const,
            label: "Erstatning",
            title: `Du mangler at betale ${formatAmount(compensationTotal)} kr. i erstatning`,
            body: "Tag fat i en voksen for at få hjælp til at betale pengene.",
            action: { label: "Vis erstatning", onClick: openCompensation },
          },
        ]
      : []),
    ...(readyCount > 0
      ? [
          {
            key: "ready",
            status: "success" as const,
            label: "Klar til dig",
            title: `${bookCount(readyCount)} er klar til afhentning`,
            action: { label: "Vis bøger", onClick: openReservations },
          },
        ]
      : []),
    ...(overdueCount > 0
      ? [
          {
            key: "overdue",
            status: "error" as const,
            label: "Frist overskredet",
            title: `${bookCount(overdueCount)} skal afleveres nu`,
            action: { label: "Vis bøger", onClick: openLoans },
          },
        ]
      : []),
    ...(dueSoonCount > 0
      ? [
          {
            key: "due-soon",
            status: "warning" as const,
            label: "Lån udløber",
            title: `${bookCount(dueSoonCount)} skal snart afleveres`,
            action: { label: "Vis bøger", onClick: openLoans },
          },
        ]
      : []),
  ]

  return <ProfileNotificationsView notifications={notifications} />
}

// The presentational section: the card grid, or the empty state when there
// is nothing to show. Split from the data wiring so stories can render the
// states directly.
export const ProfileNotificationsView = ({ notifications }: { notifications: Notification[] }) => (
  <div
    data-cy={cyKeys["profile-notifications"]}
    className="bg-background-overlay rounded-base p-grid-edge col-span-full space-y-4 md:p-8">
    <h2 className="text-typo-subtitle-sm opacity-70">Vigtige notifikationer</h2>
    {notifications.length > 0 && (
      <div className="grid gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {notifications.map(notification => (
          <NotificationCard key={notification.key} notification={notification} />
        ))}
      </div>
    )}
    {notifications.length === 0 && (
      <div
        data-cy={cyKeys["profile-notifications-empty"]}
        className="bg-background duration-dark-mode rounded-base flex flex-col items-center
          justify-center gap-2 p-8 text-center transition-all">
        <p className="text-typo-subtitle-lg">Du har styr på det hele</p>
        <p className="text-typo-body-sm text-foreground-muted">
          Der er ingen vigtige notifikationer lige nu.
        </p>
      </div>
    )}
  </div>
)

// Mirrors the loaded section: heading row and four notification cards, so
// nothing jumps when the data arrives.
export const ProfileNotificationsSkeleton = () => (
  <div className="bg-background-overlay rounded-base p-grid-edge col-span-full space-y-4 md:p-8">
    <div className="bg-background-skeleton h-[21px] w-44 animate-pulse rounded-sm" />
    <div className="grid gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-background-skeleton rounded-base h-44 animate-pulse" />
      ))}
    </div>
  </div>
)

export default ProfileNotifications
