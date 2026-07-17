import { useQueryClient } from "@tanstack/react-query"
import { differenceInDays } from "date-fns"
import React, { useState } from "react"

import {
  getEbookReadUrl,
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
  getMaterialCategory,
} from "@/components/pages/workPageLayout/helper"
import { useIsBlueTitle } from "@/components/shared/badge/BlueTitleBadge"
import { Button } from "@/components/shared/button/Button"
import { expiryStatusText } from "@/components/shared/loanCard/LoanCard"
import LoanDetailsContent from "@/components/shared/loanDetailsModal/LoanDetailsContent"
import LoanAlreadyLoanedContent from "@/components/shared/loanMaterialModal/LoanAlreadyLoanedContent"
import { publizonErrorMessageMap } from "@/components/shared/loanMaterialModal/helper"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { useModalFlow } from "@/components/shared/modalFlow/useModalFlow"
import Player from "@/components/shared/publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import useLoanThresholds from "@/hooks/useLoanThresholds"
import {
  ManifestationSearchPageTeaserFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { findManifestationByPid } from "@/lib/helpers/helper.manifestation"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"
import type { CreateLoanResult, LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"
import { getGetV1UserLoansAdapterQueryKey } from "@/lib/rest/publizon/adapter/generated/publizon"
import { ApiResponseCode } from "@/lib/rest/publizon/local-adapter/generated/model"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"
import usePostV1UserLoansIdentifier from "@/lib/rest/publizon/usePostV1UserLoansIdentifier"

// One dialog with three views: loan confirmation, "Dit lån" details after
// a successful loan, and (for audiobooks) the player.
const LoanMaterialModal = ({
  open,
  onClose,
  wid,
  pid,
}: {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}) => {
  const queryClient = useQueryClient()
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const manifestation = findManifestationByPid(data?.work, pid)
  const { mutate } = usePostV1UserLoansIdentifier()
  const { data: loansData, isLoading: isLoadingLoans } = useGetV1UserLoans()
  const { warning, danger } = useLoanThresholds()
  const [isHandlingLoan, setIsHandlingLoan] = useState(false)
  const [loanResult, setLoanResult] = useState<CreateLoanResult | null>(null)
  const flow = useModalFlow<"confirm" | "details" | "player">({ initial: "confirm" })

  const identifier = getPublizonIdentifierFromManifestation(manifestation)
  const isAlreadyLoaned =
    loansData?.loans?.some(loan => loan.libraryBook?.identifier === identifier) ?? false

  const label = manifestation ? getManifestationLabel(manifestation) : ""
  const category = getMaterialCategory(manifestation?.materialTypes[0]?.materialTypeSpecific.code)
  const isBlue = useIsBlueTitle(manifestation)

  const handleLoanMaterial = () => {
    if (!manifestation || !identifier) return
    setIsHandlingLoan(true)
    mutate(
      { identifier },
      {
        onSuccess: result => {
          setIsHandlingLoan(false)
          if (!result) {
            onClose()
            return
          }
          // Publizon's loan list lags behind the create call, so a refetch
          // would miss the new loan. Write it into the cache from the
          // create response instead.
          queryClient.setQueryData<LoanListResult>(
            getGetV1UserLoansAdapterQueryKey(),
            previous => ({
              ...previous,
              loans: [
                ...(previous?.loans ?? []),
                {
                  orderId: result.orderId,
                  orderDateUtc: new Date().toISOString(),
                  loanExpireDateUtc: result.expirationDateUtc,
                  libraryBook: { identifier },
                },
              ],
            })
          )

          // Continue to "Dit lån" with the read/listen action ready.
          if (result.expirationDateUtc) {
            setLoanResult(result)
            flow.goTo("details")
          } else {
            onClose()
          }
        },
        onError: error => {
          setIsHandlingLoan(false)
          let code: ApiResponseCode | undefined
          if (error instanceof Error) {
            try {
              code = (JSON.parse(error.message) as { code?: ApiResponseCode }).code
            } catch {
              // Non-JSON error message — fall through to the generic copy.
            }
          }
          toast.error(
            (code !== undefined && publizonErrorMessageMap[code]) ||
              "Lånet kunne ikke gennemføres. Prøv igen senere."
          )
        },
      }
    )
  }

  const titleText =
    flow.view === "player"
      ? `Lyt til ${label}`
      : flow.view === "details"
        ? "Dit lån"
        : (manifestation && `Lån ${label}`) || ""

  const daysUntilExpiry = loanResult?.expirationDateUtc
    ? differenceInDays(new Date(loanResult.expirationDateUtc), new Date())
    : null

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      onBack={flow.view === "player" ? () => flow.back() : undefined}
      viewDirection={flow.direction}
      title={flow.animatedTitle(titleText)}>
      {flow.renderBody(
        flow.view === "player" && loanResult?.orderId ? (
          <div>
            <Player type="loan" orderId={loanResult.orderId} />
          </div>
        ) : flow.view === "details" && manifestation && loanResult?.expirationDateUtc ? (
          <LoanDetailsContent
            loan={{ dueDate: loanResult.expirationDateUtc, loanDate: new Date().toISOString() }}
            manifestation={manifestation as unknown as ManifestationSearchPageTeaserFragment}
            title={data?.work?.titles.full[0] ?? ""}
            creators={displayCreators(data?.work?.creators ?? [], 1)}
            dueDateLabel="Udløber"
            blueTitle
            status={
              daysUntilExpiry !== null && (
                <StatusLabel variant={daysUntilExpiry <= warning ? "warning" : "neutral"}>
                  {expiryStatusText(daysUntilExpiry, danger)}
                </StatusLabel>
              )
            }
          />
        ) : (
          manifestation && (
            <div data-cy={cyKeys["loan-material-modal"]}>
              {isAlreadyLoaned ? (
                <LoanAlreadyLoanedContent manifestation={manifestation} />
              ) : (
                <>
                  <ManifestationCover
                    cover={manifestation.cover}
                    iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
                    className="mx-auto w-32 shrink-0"
                    costFree={isBlue}
                    iconClassName={
                      isBlue ? "bg-content-blue-100 dark:text-blue-title-dark h-10 w-10" : undefined
                    }
                  />

                  <div className="mx-auto mt-10 mb-5 w-full space-y-4">
                    <h3 className="text-typo-heading-5 text-center">
                      {`Er du sikker på, at du vil låne${` ${getManifestationLabel(manifestation, "definite")}?`}`}
                    </h3>
                  </div>
                </>
              )}
            </div>
          )
        )
      )}

      {manifestation && flow.view === "confirm" && (
        <ResponsiveDialog.Actions>
          {!isAlreadyLoaned && (
            <Button
              theme="primary"
              size="lg"
              data-cy={cyKeys["approve-loan-button"]}
              onClick={handleLoanMaterial}
              disabled={isHandlingLoan || isLoadingLoans}
              isLoading={isHandlingLoan}>
              Ja
            </Button>
          )}
          <Button size="lg" disabled={isHandlingLoan || isLoadingLoans} onClick={() => onClose()}>
            {isAlreadyLoaned ? "Luk" : "Nej"}
          </Button>
        </ResponsiveDialog.Actions>
      )}

      {flow.view === "details" && loanResult?.orderId && (
        <ResponsiveDialog.Actions>
          {category === "ebook" ? (
            <Button
              theme="primary"
              size="lg"
              ariaLabel={`Læs ${label}`}
              data-cy={cyKeys["read-loan-button"]}
              asChild>
              <SmartLink href={getEbookReadUrl(wid, loanResult.orderId)} reload>
                Læs {label}
              </SmartLink>
            </Button>
          ) : category === "audio" ? (
            <Button
              theme="primary"
              size="lg"
              ariaLabel={`Lyt til ${label}`}
              data-cy={cyKeys["listen-loan-button"]}
              onClick={() => flow.goTo("player")}>
              Lyt til {label}
            </Button>
          ) : null}
        </ResponsiveDialog.Actions>
      )}
    </ResponsiveDialog>
  )
}

export default LoanMaterialModal
