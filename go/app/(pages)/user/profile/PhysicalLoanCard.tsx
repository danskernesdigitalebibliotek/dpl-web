"use client"

import { type Loan } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { differenceInDays } from "date-fns"
import Link from "next/link"
import { useState } from "react"

import { getManifestationMaterialTypeIcon } from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import LoanDetailsModal from "@/components/shared/loanDetailsModal/LoanDetailsModal"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import { cyKeys } from "@/cypress/support/constants"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { resolveUrl } from "@/lib/helpers/helper.routes"

export type PhysicalLoanCardProps = {
  loan: Loan
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  workId: string
  creators?: string
  className?: string
}

const dueStatusText = (daysUntil: number) => {
  if (daysUntil <= 0) {
    return "Skal afleveres nu"
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
  const isDueNow = daysUntil <= 0
  const [showLoanDetails, setShowLoanDetails] = useState(false)

  return (
    <div className={cn("relative flex aspect-5/7 h-full w-full", className)}>
      <div className="h-full w-full">
        <div className="block h-full w-full space-y-3 px-[15%]">
          <Link
            prefetch={false}
            aria-label={`Tilgå værket ${title}. ${dueStatusText(daysUntil)}`}
            className="focus-visible outline-accent-foreground rounded-base relative block h-[85%]
              focus:outline-offset-2"
            href={resolveUrl({
              routeParams: { work: "work", wid: workId },
              queryParams: {
                type: manifestation.materialTypes[0].materialTypeSpecific.code,
              },
            })}>
            <CoverPicture
              covers={manifestation.cover}
              alt={`${title} cover billede`}
              withTilt={false}
              className="select-none"
            />
            <MaterialTypeIconWrapper
              iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
              className="bg-background-overlay-solid relative z-10 mx-auto -mt-14 outline-1"
            />
          </Link>
          <p
            className={cn(
              "text-typo-subtitle-sm w-full text-center break-words",
              isDueNow ? "text-error-red-400 dark:text-error-red-200" : "text-foreground-muted"
            )}>
            {isDueNow && (
              <span
                className="bg-error-red-400 dark:bg-error-red-200 mr-2 inline-block h-2 w-2
                  rounded-full"
              />
            )}
            {dueStatusText(daysUntil)}
          </p>
          {loan.isRenewable && (
            <div className="flex w-full justify-center">
              <Button
                size="sm"
                ariaLabel={`Forny lån af ${title}`}
                data-cy={cyKeys["renew-loan-button"]}
                onClick={() => setShowLoanDetails(true)}>
                Forny lån
              </Button>
            </div>
          )}
        </div>
      </div>
      <LoanDetailsModal
        open={showLoanDetails}
        onClose={() => setShowLoanDetails(false)}
        loan={loan}
        manifestation={manifestation}
        title={title}
        creators={creators}
      />
    </div>
  )
}

export default PhysicalLoanCard
