"use client"

import { type Loan } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { differenceInDays } from "date-fns"

import { getManifestationMaterialTypeIcon } from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { cyKeys } from "@/cypress/support/constants"
import useLoanThresholds from "@/hooks/useLoanThresholds"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { openModal } from "@/store/modal.store"

export type PhysicalLoanCardProps = {
  loan: Loan
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  workId: string
  creators?: string
  className?: string
}

export const dueStatusText = (daysUntil: number) => {
  if (daysUntil <= 0) {
    return "Skal afleveres i dag"
  }
  return `Skal afleveres om ${daysUntil} ${daysUntil === 1 ? "dag" : "dage"}`
}

const PhysicalLoanCard = ({
  loan,
  manifestation,
  title,
  workId,
  creators,
  className,
}: PhysicalLoanCardProps) => {
  const daysUntil = differenceInDays(new Date(loan.dueDate), new Date())
  // Same thresholds as dpl-react's loan list: red when the due date has
  // passed, orange warning when it is getting close.
  const { warning, danger } = useLoanThresholds()
  const isOverdue = daysUntil < danger
  const isDueSoon = !isOverdue && daysUntil <= warning
  // Compact single-line labels; the expanded (subline) StatusLabel form is
  // reserved for modal contexts.
  const statusText = isOverdue ? "Afleveringsfrist overskredet" : dueStatusText(daysUntil)

  return (
    <div className={cn("relative w-full", className)}>
      <div className="w-full space-y-3 px-[15%]">
        <button
          type="button"
          aria-label={`Se detaljer om dit lån af ${title}. ${statusText}`}
          className="focus-visible outline-accent-foreground rounded-base relative block w-full
            cursor-pointer focus:outline-offset-2"
          onClick={() =>
            openModal("LoanDetailsModal", { loan, manifestation, title, workId, creators })
          }>
          <ManifestationCover
            cover={manifestation.cover}
            iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
            alt={`${title} cover billede`}
            className="w-full"
            iconClassName="bg-background-overlay-solid"
          />
        </button>
        {/* pt clears the material-type icon straddling the cover's bottom edge. */}
        <div className="flex w-full justify-center pt-5">
          <StatusLabel variant={isOverdue ? "error" : isDueSoon ? "warning" : "neutral"}>
            {statusText}
          </StatusLabel>
        </div>
        {loan.isRenewable && (
          <div className="flex w-full justify-center">
            <Button
              size="sm"
              ariaLabel={`Forny lån af ${title}`}
              data-cy={cyKeys["renew-loan-button"]}
              onClick={() =>
                openModal("LoanDetailsModal", { loan, manifestation, title, workId, creators })
              }>
              Forny lån
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PhysicalLoanCard
