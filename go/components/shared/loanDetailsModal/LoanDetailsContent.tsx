"use client"

import { format } from "date-fns"
import { da } from "date-fns/locale"
import React from "react"

import { getManifestationMaterialTypeIcon } from "@/components/pages/workPageLayout/helper"
import BlueTitleBadge, { useIsBlueTitle } from "@/components/shared/badge/BlueTitleBadge"
import InfoCard from "@/components/shared/infoCard/InfoCard"
import ModalMaterialHeader from "@/components/shared/modalMaterialHeader/ModalMaterialHeader"
import { cyKeys } from "@/cypress/support/constants"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"

// Structurally compatible with the service-layer Loan; digital loans pass a
// subset (no renewal, no material number) mapped from Publizon data.
export type LoanDetails = {
  loanId?: number
  dueDate: string
  loanDate?: string
  materialItemNumber?: string
  isRenewable?: boolean
}

type LoanDetailsContentProps = {
  loan: LoanDetails
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  creators?: string
  // Physical loans are returned ("Afleveres"); digital loans just run out.
  dueDateLabel?: string
  // Due-status label shown under the title/author.
  status?: React.ReactNode
  // Link target for the title (the material's work page).
  href?: string
  // Blue title traits (digital loans only): "BLÅ" badge above the title
  // and the blue material-type icon on cost-free titles.
  blueTitle?: boolean
}

const formatLoanDate = (date: string) => format(new Date(date), "d. MMMM yyyy", { locale: da })

const LoanDetailsContent = ({
  loan,
  manifestation,
  title,
  creators,
  dueDateLabel = "Afleveres",
  status,
  href,
  blueTitle = false,
}: LoanDetailsContentProps) => {
  const isBlue = useIsBlueTitle(manifestation, blueTitle)

  return (
    <div data-cy={cyKeys["loan-details-modal"]} className="space-y-8">
      <ModalMaterialHeader
        cover={manifestation.cover}
        iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
        title={title}
        subtitle={creators ? `Af ${creators}` : null}
        alt={`${title} cover billede`}
        status={status}
        href={href}
        badge={
          isBlue ? (
            <BlueTitleBadge manifestation={manifestation} className="self-start" />
          ) : undefined
        }
        costFree={isBlue}
        iconClassName={isBlue ? "bg-content-blue-100 dark:text-blue-title-dark" : undefined}
      />

      <hr className="border-foreground/10" />

      <div className="space-y-4">
        <InfoCard icon="calendar-check" title={dueDateLabel} value={formatLoanDate(loan.dueDate)} />
        {loan.loanDate && (
          <InfoCard icon="clock" title="Udlånsdato" value={formatLoanDate(loan.loanDate)} />
        )}
        {loan.materialItemNumber && (
          <InfoCard icon="document" title="Materialenummer" value={loan.materialItemNumber} />
        )}
      </div>
    </div>
  )
}

export default LoanDetailsContent
