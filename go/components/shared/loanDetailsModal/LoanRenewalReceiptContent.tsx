"use client"

import type { RenewedLoan } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { format } from "date-fns"
import { da } from "date-fns/locale"
import React from "react"

import {
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
} from "@/components/pages/workPageLayout/helper"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import ReceiptStat from "@/components/shared/receiptStat/ReceiptStat"
import { cyKeys } from "@/cypress/support/constants"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"

type LoanRenewalReceiptProps = {
  manifestation: ManifestationSearchPageTeaserFragment
  renewedLoan: RenewedLoan
  title: string
}

const LoanRenewalReceiptContent = ({
  manifestation,
  renewedLoan,
  title,
}: LoanRenewalReceiptProps) => (
  <div
    data-cy={cyKeys["renew-loan-receipt"]}
    className="mx-auto flex max-w-prose flex-col items-center gap-y-8 text-center">
    <ManifestationCover
      cover={manifestation.cover}
      iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
      className="aspect-[4/5] w-32 shrink-0"
    />
    <div className="flex flex-col gap-y-4">
      <h2 className="text-typo-heading-4 mt-2 first-letter:uppercase">
        {getManifestationLabel(manifestation, "definite")} er fornyet!
      </h2>
      <p className="text-typo-subtitle-md text-foreground-muted">
        Du kan beholde &ldquo;{title}&rdquo; lidt længere.
      </p>
    </div>

    <dl className="grid w-full grid-cols-1 gap-4">
      <ReceiptStat
        term="Skal afleveres"
        value={format(new Date(renewedLoan.dueDate), "d. MMMM yyyy", { locale: da })}
        dataCy={cyKeys["renew-loan-receipt-due-date"]}
      />
    </dl>
  </div>
)

export default LoanRenewalReceiptContent
