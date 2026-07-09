import { useQueryClient } from "@tanstack/react-query"
import { first } from "lodash"
import React, { useState } from "react"

import {
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
} from "@/components/pages/workPageLayout/helper"
import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { Button } from "@/components/shared/button/Button"
import LoanAlreadyLoanedContent from "@/components/shared/loanMaterialModal/LoanAlreadyLoanedContent"
import { publizonErrorMessageMap } from "@/components/shared/loanMaterialModal/helper"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { findManifestationByPid } from "@/lib/helpers/helper.manifestation"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"
import { getGetV1UserLoansAdapterQueryKey } from "@/lib/rest/publizon/adapter/generated/publizon"
import { ApiResponseCode } from "@/lib/rest/publizon/local-adapter/generated/model"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"
import usePostV1UserLoansIdentifier from "@/lib/rest/publizon/usePostV1UserLoansIdentifier"

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
  const [isHandlingLoan, setIsHandlingLoan] = useState(false)

  const identifier = first(manifestation?.identifiers)?.value
  const isAlreadyLoaned =
    loansData?.loans?.some(loan => loan.libraryBook?.identifier === identifier) ?? false

  const handleLoanMaterial = () => {
    if (!manifestation) return
    const isbns = getIsbnsFromManifestation(manifestation)
    setIsHandlingLoan(true)
    mutate(
      { identifier: isbns[0] },
      {
        onSuccess: () => {
          // Refetch data to update the UI for WorkPageButtons
          queryClient.invalidateQueries({ queryKey: getGetV1UserLoansAdapterQueryKey() })
          setIsHandlingLoan(false)
          onClose()
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

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={(manifestation && `Lån ${getManifestationLabel(manifestation)}`) || ""}>
      <AnimateChangeInHeight>
        {manifestation && (
          <div className="mx-auto max-w-prose" data-cy={cyKeys["loan-material-modal"]}>
            {isAlreadyLoaned ? (
              <LoanAlreadyLoanedContent manifestation={manifestation} />
            ) : (
              <>
                <ManifestationCover
                  cover={manifestation.cover}
                  iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
                  className="rounded-base flex aspect-1/1 h-36 w-full flex-col items-center
                    justify-center lg:aspect-4/5"
                />

                <div className="mx-auto mt-10 mb-5 w-full space-y-4">
                  <h3 className="text-typo-heading-5 text-center">
                    {`Er du sikker på, at du vil låne${` ${getManifestationLabel(manifestation, "definite")}?`}`}
                  </h3>
                </div>
              </>
            )}
          </div>
        )}
      </AnimateChangeInHeight>

      {manifestation && (
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
    </ResponsiveDialog>
  )
}

export default LoanMaterialModal
