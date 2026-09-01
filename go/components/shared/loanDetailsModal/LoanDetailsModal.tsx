"use client"

import { type RenewedLoan, useRenewLoans } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/shared/button/Button"
import LoanDetailsContent, {
  type LoanDetails,
} from "@/components/shared/loanDetailsModal/LoanDetailsContent"
import LoanRenewalReceiptContent from "@/components/shared/loanDetailsModal/LoanRenewalReceiptContent"
import PhysicalDueStatusLabel from "@/components/shared/loanDetailsModal/PhysicalDueStatusLabel"
import RenewLoanAction from "@/components/shared/loanDetailsModal/RenewLoanAction"
import { getRenewalFailureMessage } from "@/components/shared/loanDetailsModal/helper"
import { ModalFlowBody } from "@/components/shared/modalFlow/ModalFlowBody"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { toast } from "@/components/shared/toaster/Toaster"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

// Data props — `open`/`onClose` come from the DynamicModal host.
export type LoanDetailsModalProps = {
  loan: LoanDetails
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  // Links the modal title to the material's work page when provided.
  workId?: string
  creators?: string
  // Physical loans are returned ("Afleveres"); digital loans just run out.
  dueDateLabel?: string
}

const LoanDetailsModal = ({
  open,
  onClose,
  loan,
  manifestation,
  title,
  workId,
  creators,
  dueDateLabel = "Afleveres",
}: LoanDetailsModalProps & { open: boolean; onClose: () => void }) => {
  const { mutate: renewLoans, isPending: isRenewing } = useRenewLoans()
  const [renewedLoan, setRenewedLoan] = useState<RenewedLoan | null>(null)

  // Start each opening from a clean slate.
  useEffect(() => {
    if (open) {
      setRenewedLoan(null)
    }
  }, [open])

  // The receipt is only shown after a renewal in this session.
  const isReceiptStep = renewedLoan !== null

  // Only physical (FBS) loans carry a loanId and can be renewed at all;
  // digital loans just run out and keep a plain close button.
  const isPhysical = loan.loanId !== undefined

  const handleRenew = () => {
    if (isRenewing || loan.loanId === undefined) return
    renewLoans([loan.loanId], {
      onSuccess: renewedLoans => {
        const result = renewedLoans.find(r => r.loanId === loan.loanId)
        if (result?.renewed) {
          setRenewedLoan(result)
        } else {
          toast.error(getRenewalFailureMessage(result?.reason ?? "deniedOtherReason"))
        }
      },
      onError: () => {
        // Network / non-JSON — surface via the generic copy bucket.
        toast.error(getRenewalFailureMessage("deniedOtherReason"))
      },
    })
  }

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Dit lån">
      <ModalFlowBody viewKey={isReceiptStep ? "receipt" : "details"}>
        {isReceiptStep && renewedLoan ? (
          <LoanRenewalReceiptContent
            manifestation={manifestation}
            renewedLoan={renewedLoan}
            title={title}
          />
        ) : (
          <LoanDetailsContent
            loan={loan}
            manifestation={manifestation}
            title={title}
            creators={creators}
            dueDateLabel={dueDateLabel}
            href={
              workId
                ? resolveUrl({
                    routeParams: { work: "work", wid: workId },
                    queryParams: {
                      type: manifestation.materialTypes[0].materialTypeSpecific.code,
                    },
                  })
                : undefined
            }
            status={<PhysicalDueStatusLabel dueDate={loan.dueDate} />}
          />
        )}
      </ModalFlowBody>

      <ResponsiveDialog.Actions>
        {isReceiptStep ? (
          <Button theme="primary" size="lg" onClick={onClose}>
            OK
          </Button>
        ) : isPhysical ? (
          <RenewLoanAction
            loan={loan}
            title={title}
            isRenewing={isRenewing}
            onRenew={handleRenew}
          />
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
