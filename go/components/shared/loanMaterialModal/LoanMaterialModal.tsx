import {
  digitalLoansQueryKey,
  useDigitalCreateLoan,
  useDigitalLoans,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useQueryClient } from "@tanstack/react-query"
import React, { useState } from "react"

import {
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
  getMaterialCategory,
  getReadUrlForLoan,
} from "@/components/pages/workPageLayout/helper"
import { useIsBlueTitle } from "@/components/shared/badge/BlueTitleBadge"
import { Button } from "@/components/shared/button/Button"
import DigitalExpiryStatusLabel from "@/components/shared/loanCard/DigitalExpiryStatusLabel"
import LoanDetailsContent from "@/components/shared/loanDetailsModal/LoanDetailsContent"
import LoanAlreadyLoanedContent from "@/components/shared/loanMaterialModal/LoanAlreadyLoanedContent"
import { publizonErrorMessageMap } from "@/components/shared/loanMaterialModal/helper"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { useModalFlow } from "@/components/shared/modalFlow/useModalFlow"
import Player from "@/components/shared/publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import { uniloginDigitalLoanErrorText, useBiblioAdapter } from "@/hooks/useBiblioAdapter"
import useSession from "@/hooks/useSession"
import {
  ManifestationSearchPageTeaserFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { findManifestationByPid } from "@/lib/helpers/helper.manifestation"
import { findBiblioLoan, findPublizonLoan } from "@/lib/helpers/helper.patron"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"
import type { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"
import { getGetV1UserLoansAdapterQueryKey } from "@/lib/rest/publizon/adapter/generated/publizon"
import { ApiResponseCode } from "@/lib/rest/publizon/local-adapter/generated/model"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"
import usePostV1UserLoansIdentifier from "@/lib/rest/publizon/usePostV1UserLoansIdentifier"
import { playLoan } from "@/store/player.store"

// The outcome of a successful loan, whichever provider made it: exactly one
// of orderId (Publizon) / loanId (Biblio) is set and decides how the loan
// opens from the details view.
// TODO(publizon-sunset): remove when the Publizon API is phased out —
// orderId goes, and with it handlePublizonLoan, the Publizon half of
// isAlreadyLoaned, the in-modal player view and publizonErrorMessageMap.
type TLoanOutcome = {
  orderId?: string
  loanId?: string
  expiresUtc: string
}

// The adapter answers a declined request with a decision status rather than
// an HTTP error - the statuses a patron can do something about get their own
// message.
const biblioDeclineMessageMap: Record<string, string> = {
  monthly_limit_exceeded: "Du har nået din lånegrænse for denne måned.",
  concurrent_limit_exceeded: "Du har nået grænsen for, hvor mange lån du kan have samtidig.",
}

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
  const viaBiblioAdapter = useBiblioAdapter()
  const { session } = useSession()
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const manifestation = findManifestationByPid(data?.work, pid)
  const { mutate } = usePostV1UserLoansIdentifier()
  const { mutate: mutateBiblio } = useDigitalCreateLoan()
  const { data: loansData, isLoading: isLoadingLoans } = useGetV1UserLoans()
  // Patron-gated in the service layer — never fires for Unilogin sessions.
  const { data: biblioLoansData } = useDigitalLoans({ enabled: viaBiblioAdapter })
  const [isHandlingLoan, setIsHandlingLoan] = useState(false)
  const [loanResult, setLoanResult] = useState<TLoanOutcome | null>(null)
  const flow = useModalFlow<"confirm" | "details" | "player">({ initial: "confirm" })

  const identifier = getPublizonIdentifierFromManifestation(manifestation)
  // Loaned through either provider counts: an existing Publizon loan keeps
  // working after the switch to the Biblio adapter.
  const isAlreadyLoaned =
    Boolean(findPublizonLoan(loansData, identifier)) ||
    Boolean(findBiblioLoan(biblioLoansData?.loans, identifier))

  const label = manifestation ? getManifestationLabel(manifestation) : ""
  const category = getMaterialCategory(manifestation?.materialTypes[0]?.materialTypeSpecific.code)
  const isBlue = useIsBlueTitle(manifestation)

  const handlePublizonLoan = () => {
    if (!identifier) return
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
            setLoanResult({
              orderId: result.orderId ?? undefined,
              expiresUtc: result.expirationDateUtc,
            })
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

  const handleBiblioLoan = () => {
    if (!identifier) return
    setIsHandlingLoan(true)
    mutateBiblio(identifier, {
      onSuccess: result => {
        setIsHandlingLoan(false)
        // The adapter can accept the request without creating a loan - an
        // exceeded quota, say - so `loan` is the success signal.
        if (!result.loan) {
          toast.error(
            biblioDeclineMessageMap[result.status] ??
              "Lånet kunne ikke gennemføres. Prøv igen senere."
          )
          return
        }
        queryClient.invalidateQueries({ queryKey: digitalLoansQueryKey() })
        setLoanResult({ loanId: result.loan.loanId, expiresUtc: result.loan.endDate })
        flow.goTo("details")
      },
      onError: () => {
        setIsHandlingLoan(false)
        toast.error("Lånet kunne ikke gennemføres. Prøv igen senere.")
      },
    })
  }

  // New loans go through exactly one provider: the Biblio adapter once the
  // library has switched, Publizon until then.
  const handleLoanMaterial = () => {
    if (!manifestation) return
    if (viaBiblioAdapter) {
      // Unilogin cannot authenticate against the Biblio adapter, and with the
      // adapter on there is no Publizon fallback for new loans. The attempt
      // is answered here rather than with a request that cannot succeed.
      if (session?.type === "unilogin") {
        toast.error(uniloginDigitalLoanErrorText)
        return
      }
      handleBiblioLoan()
    } else {
      handlePublizonLoan()
    }
  }

  const titleText =
    flow.view === "player"
      ? `Lyt til ${label}`
      : flow.view === "details"
        ? "Dit lån"
        : (manifestation && `Lån ${label}`) || ""

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
        ) : flow.view === "details" && manifestation && loanResult?.expiresUtc ? (
          <LoanDetailsContent
            loan={{ dueDate: loanResult.expiresUtc, loanDate: new Date().toISOString() }}
            manifestation={manifestation as unknown as ManifestationSearchPageTeaserFragment}
            title={data?.work?.titles.full[0] ?? ""}
            creators={displayCreators(data?.work?.creators ?? [], 1)}
            dueDateLabel="Udløber"
            blueTitle
            status={<DigitalExpiryStatusLabel dueDate={loanResult?.expiresUtc} />}
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

      {flow.view === "details" && (loanResult?.orderId || loanResult?.loanId) && (
        <ResponsiveDialog.Actions>
          {category === "ebook" ? (
            <Button
              theme="primary"
              size="lg"
              ariaLabel={`Læs ${label}`}
              data-cy={cyKeys["read-loan-button"]}
              asChild>
              <SmartLink href={getReadUrlForLoan(wid, loanResult)} reload>
                Læs {label}
              </SmartLink>
            </Button>
          ) : category === "audio" ? (
            <Button
              theme="primary"
              size="lg"
              ariaLabel={`Lyt til ${label}`}
              data-cy={cyKeys["listen-loan-button"]}
              onClick={() => {
                // A Biblio loan plays in the global player bar, which
                // survives navigation - the modal's embedded player view is
                // Publizon only.
                if (loanResult.loanId) {
                  playLoan(loanResult.loanId)
                  onClose()
                } else {
                  flow.goTo("player")
                }
              }}>
              Lyt til {label}
            </Button>
          ) : null}
        </ResponsiveDialog.Actions>
      )}
    </ResponsiveDialog>
  )
}

export default LoanMaterialModal
