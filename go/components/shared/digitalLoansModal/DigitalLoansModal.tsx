"use client"

import { differenceInDays } from "date-fns"
import React, { useEffect, useState } from "react"

import { getEbookReadUrl } from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import { expiryStatusText } from "@/components/shared/loanCard/LoanCard"
import LoanDetailsContent from "@/components/shared/loanDetailsModal/LoanDetailsContent"
import { useModalFlow } from "@/components/shared/modalFlow/useModalFlow"
import ModalMaterialList from "@/components/shared/modalMaterialList/ModalMaterialList"
import ModalMaterialListItem from "@/components/shared/modalMaterialList/ModalMaterialListItem"
import Player from "@/components/shared/publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { cyKeys } from "@/cypress/support/constants"
import useLoanThresholds from "@/hooks/useLoanThresholds"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import {
  type SelectedLoan,
  buildSelectedLoan,
  digitalLoanForWork,
  sortWorksBySoonestExpiry,
} from "@/lib/helpers/helper.patron"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"

// Data props — `open`/`onClose` come from the DynamicModal host.
export type DigitalLoansModalProps = {
  works: WorkTeaserSearchPageFragment[]
  loanData: LoanListResult
  // Opens directly on this loan's details (e.g. from a slider card);
  // there is then no back navigation to the list.
  initialLoan?: SelectedLoan | null
}

// One dialog with three views: loan list, "Dit lån" details and (for
// audiobooks) the player.
const DigitalLoansModal = ({
  open,
  onClose,
  works,
  loanData,
  initialLoan,
}: DigitalLoansModalProps & { open: boolean; onClose: () => void }) => {
  const { warning, danger } = useLoanThresholds()
  const [selectedLoan, setSelectedLoan] = useState<SelectedLoan | null>(null)
  const flow = useModalFlow<"list" | "detail" | "player">({ initial: "list" })

  // Start from the list — or the requested loan — whenever the modal opens.
  useEffect(() => {
    if (open) {
      setSelectedLoan(initialLoan ?? null)
      flow.reset(initialLoan ? "detail" : "list")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Soonest-expiring loans first; works without a matching loan go last.
  const sortedWorks = sortWorksBySoonestExpiry(works, loanData)

  const goBack = () => {
    const target = flow.back()
    if (target === "list") {
      setSelectedLoan(null)
    }
  }

  const titleText =
    flow.view === "player"
      ? `Lyt til ${selectedLoan?.label ?? ""}`
      : flow.view === "detail"
        ? "Dit lån"
        : `Digitale lån (${loanData.loans?.length ?? 0})`

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      onBack={flow.canGoBack ? goBack : undefined}
      viewDirection={flow.direction}
      title={flow.animatedTitle(titleText)}>
      {flow.renderBody(
        flow.view === "player" && selectedLoan?.orderId ? (
          <div>
            <Player type="loan" orderId={selectedLoan.orderId} />
          </div>
        ) : flow.view === "detail" && selectedLoan ? (
          <LoanDetailsContent
            loan={{ dueDate: selectedLoan.dueDate, loanDate: selectedLoan.loanDate }}
            manifestation={selectedLoan.manifestation}
            title={selectedLoan.title}
            creators={selectedLoan.creators}
            dueDateLabel="Udløber"
            blueTitle
            href={resolveUrl({
              routeParams: { work: "work", wid: selectedLoan.workId },
              queryParams: {
                type: selectedLoan.manifestation.materialTypes[0].materialTypeSpecific.code,
              },
            })}
            status={(() => {
              const daysUntil = differenceInDays(new Date(selectedLoan.dueDate), new Date())
              return (
                <StatusLabel variant={daysUntil <= warning ? "warning" : "neutral"}>
                  {expiryStatusText(daysUntil, danger)}
                </StatusLabel>
              )
            })()}
          />
        ) : (
          <ModalMaterialList dataCy={cyKeys["digital-loans-modal"]}>
            {sortedWorks.map(work => {
              const manifestation = work.manifestations.all[0]
              const loan = digitalLoanForWork(work, loanData)
              const daysUntil = loan?.loanExpireDateUtc
                ? differenceInDays(new Date(loan.loanExpireDateUtc), new Date())
                : null
              const creators = displayCreators(work.creators, 1)
              const title = work.titles.full[0]

              return (
                <ModalMaterialListItem
                  key={manifestation.pid}
                  manifestation={manifestation}
                  title={title}
                  creators={creators}
                  blueTitle
                  ariaLabel={`Se detaljer om dit lån af ${title}`}
                  onSelect={() => {
                    const selection = buildSelectedLoan(work, loanData)
                    if (!selection) return
                    setSelectedLoan(selection)
                    flow.goTo("detail")
                  }}
                  status={
                    daysUntil !== null && (
                      <StatusLabel variant={daysUntil <= warning ? "warning" : "neutral"}>
                        {expiryStatusText(daysUntil, danger)}
                      </StatusLabel>
                    )
                  }
                />
              )
            })}
          </ModalMaterialList>
        )
      )}

      {flow.view === "detail" && selectedLoan?.orderId && (
        <ResponsiveDialog.Actions>
          {selectedLoan.category === "ebook" ? (
            <Button
              theme="primary"
              size="lg"
              ariaLabel={`Læs ${selectedLoan.label}`}
              data-cy={cyKeys["read-loan-button"]}
              asChild>
              <SmartLink href={getEbookReadUrl(selectedLoan.workId, selectedLoan.orderId)} reload>
                Læs {selectedLoan.label}
              </SmartLink>
            </Button>
          ) : selectedLoan.category === "audio" ? (
            <Button
              theme="primary"
              size="lg"
              ariaLabel={`Lyt til ${selectedLoan.label}`}
              data-cy={cyKeys["listen-loan-button"]}
              onClick={() => flow.goTo("player")}>
              Lyt til {selectedLoan.label}
            </Button>
          ) : null}
        </ResponsiveDialog.Actions>
      )}
    </ResponsiveDialog>
  )
}

export default DigitalLoansModal
