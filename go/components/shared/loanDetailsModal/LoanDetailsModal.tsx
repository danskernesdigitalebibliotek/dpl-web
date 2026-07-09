"use client"

import {
  type Loan,
  type RenewedLoan,
  useRenewLoans,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { format } from "date-fns"
import { da } from "date-fns/locale"
import React, { useEffect, useState } from "react"

import { getManifestationMaterialTypeIcon } from "@/components/pages/workPageLayout/helper"
import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { Button } from "@/components/shared/button/Button"
import InfoCard from "@/components/shared/infoCard/InfoCard"
import LoanRenewalReceiptContent from "@/components/shared/loanDetailsModal/LoanRenewalReceiptContent"
import ModalMaterialHeader from "@/components/shared/modalMaterialHeader/ModalMaterialHeader"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"

type Props = {
  open: boolean
  onClose: () => void
  loan: Loan
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  creators?: string
}

const formatLoanDate = (date: string) => format(new Date(date), "d. MMMM yyyy", { locale: da })

const LoanDetailsModal = ({ open, onClose, loan, manifestation, title, creators }: Props) => {
  const { mutate: renewLoans, isPending: isRenewing } = useRenewLoans()
  const [renewedLoan, setRenewedLoan] = useState<RenewedLoan | null>(null)

  // The modal stays mounted between openings; start each visit from a clean
  // slate so a previous renewal outcome doesn't leak into the next one.
  useEffect(() => {
    if (open) {
      setRenewedLoan(null)
    }
  }, [open])

  // Receipt is only shown after the user actually renewed in this session;
  // the renewal result carries the new due date.
  const isReceiptStep = renewedLoan !== null

  const handleRenew = () => {
    if (isRenewing) return
    renewLoans([loan.loanId], {
      onSuccess: renewedLoans => {
        const renewed = renewedLoans.find(r => r.loanId === loan.loanId && r.renewed)
        if (renewed) {
          setRenewedLoan(renewed)
        } else {
          toast.error("Lånet kunne ikke fornys. Prøv igen senere.")
        }
      },
      onError: () => toast.error("Lånet kunne ikke fornys. Prøv igen senere."),
    })
  }

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Dit lån">
      <AnimateChangeInHeight>
        {isReceiptStep && renewedLoan ? (
          <LoanRenewalReceiptContent
            manifestation={manifestation}
            renewedLoan={renewedLoan}
            title={title}
          />
        ) : (
          <div data-cy={cyKeys["loan-details-modal"]} className="mx-auto max-w-prose space-y-8">
            <ModalMaterialHeader
              cover={manifestation.cover}
              iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
              title={title}
              subtitle={creators ? `Af ${creators}` : null}
              alt={`${title} cover billede`}
            />

            <hr className="border-foreground/10" />

            <div className="space-y-4">
              <InfoCard
                icon="calendar-check"
                title="Afleveres"
                value={formatLoanDate(loan.dueDate)}
              />
              <InfoCard icon="clock" title="Udlånsdato" value={formatLoanDate(loan.loanDate)} />
              <InfoCard icon="document" title="Materialenummer" value={loan.materialItemNumber} />
            </div>
          </div>
        )}
      </AnimateChangeInHeight>

      <ResponsiveDialog.Actions>
        {isReceiptStep ? (
          <Button theme="primary" size="lg" onClick={onClose}>
            OK
          </Button>
        ) : loan.isRenewable ? (
          <Button
            theme="primary"
            size="lg"
            isLoading={isRenewing}
            ariaLabel={`Forny lån af ${title}`}
            data-cy={cyKeys["approve-renew-loan-button"]}
            onClick={handleRenew}>
            Forny lån
          </Button>
        ) : (
          <Button theme="primary" size="lg" onClick={onClose}>
            Luk
          </Button>
        )}
      </ResponsiveDialog.Actions>
    </ResponsiveDialog>
  )
}

export default LoanDetailsModal
