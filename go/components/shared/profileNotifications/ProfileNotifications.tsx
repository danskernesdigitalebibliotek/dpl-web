"use client"

import { useFees } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import { Button } from "@/components/shared/button/Button"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { cyKeys } from "@/cypress/support/constants"
import usePatronShelf from "@/hooks/usePatronShelf"
import { dueStatus } from "@/lib/helpers/helper.due-status"
import { formatAmount, summarizeFees } from "@/lib/helpers/helper.fees"
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
    <div className="space-y-2">
      <p className="text-typo-subtitle-sm">{notification.title}</p>
      {notification.body && (
        <p className="text-typo-body-sm text-foreground-muted">{notification.body}</p>
      )}
    </div>
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
  const {
    loanItems,
    reservationItems,
    isLibraryLogin,
    isLoading: isLoadingShelf,
    isError: isErrorShelf,
  } = usePatronShelf()
  const {
    data: fees,
    isLoading: isLoadingFees,
    isError: isErrorFees,
  } = useFees({ enabled: isLibraryLogin })

  const isLoading = isLoadingShelf || isLoadingFees
  const isError = isErrorShelf || isErrorFees

  const {
    unpaidTotal,
    lateFeeTotal,
    lateMaterialCount,
    compensationTotal,
    compensationMaterialCount,
  } = summarizeFees(fees ?? [])

  if (isLoading) {
    return <ProfileNotificationsSkeleton />
  }

  if (!isLibraryLogin) {
    return null
  }

  // A failed query must never render the reassuring empty state — the child
  // may well have fees or overdue loans.
  if (isError) {
    return <ProfileNotificationsView hasError notifications={[]} />
  }

  const readyCount = reservationItems.filter(
    ({ reservation }) => reservation.state === "readyForPickup"
  ).length
  // A loan due today is still on time and counts as due soon.
  const overdueCount = loanItems.filter(
    ({ loan }) => dueStatus(loan.dueDate).state === "overdue"
  ).length
  const dueSoonCount = loanItems.filter(({ loan }) => {
    const { state } = dueStatus(loan.dueDate)
    return state === "due-today" || state === "due-soon"
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
            title: `Der mangler at blive betalt ${formatAmount(unpaidTotal)} kr.`,
            body: "Du har afleveret nogle bøger for sent på biblioteket. Få hjælp fra en voksen.",
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
            label: "Mangler betaling",
            title: `Der mangler at blive betalt ${formatAmount(compensationTotal)} kr. i erstatning`,
            // FBS doesn't say why the compensation was charged, so the copy
            // lists the possible causes like CompensationModal does.
            body: "Det sker, når en bog bliver væk, går i stykker eller ikke bliver afleveret. Få hjælp fra en voksen.",
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
            title: `${bookCount(readyCount)} er klar til afhentning på biblioteket`,
            action: { label: "Vis reserveringer", onClick: openReservations },
          },
        ]
      : []),
    ...(overdueCount > 0
      ? [
          {
            key: "overdue",
            status: "error" as const,
            label: "Frist overskredet",
            title: `${bookCount(overdueCount)} mangler at blive afleveret på biblioteket`,
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
            title: `${bookCount(dueSoonCount)} skal snart afleveres på biblioteket`,
            action: { label: "Vis bøger", onClick: openLoans },
          },
        ]
      : []),
  ]

  return <ProfileNotificationsView notifications={notifications} />
}

// The presentational section: the card grid, the empty state when there is
// nothing to show, or an honest error line when the data couldn't be
// fetched. Split from the data wiring so stories can render the states
// directly.
export const ProfileNotificationsView = ({
  notifications,
  hasError = false,
}: {
  notifications: Notification[]
  hasError?: boolean
}) => {
  return (
    <div
      data-cy={cyKeys["profile-notifications"]}
      className="bg-background-overlay rounded-base p-grid-edge col-span-full space-y-4 md:p-8">
      <h2 className="text-typo-subtitle-sm opacity-70">Vigtige notifikationer</h2>
      {hasError ? (
        <p data-cy={cyKeys["profile-notifications-error"]} className="text-typo-body-md">
          Vi kunne ikke hente dine notifikationer lige nu. Prøv igen senere.
        </p>
      ) : notifications.length === 0 ? (
        <p data-cy={cyKeys["profile-notifications-empty"]} className="text-typo-body-md">
          Alt ser fint ud. Du har ingen gebyrer eller bøger, der skal afleveres/hentes.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
          {notifications.map(notification => (
            <NotificationCard key={notification.key} notification={notification} />
          ))}
        </div>
      )}
    </div>
  )
}

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
