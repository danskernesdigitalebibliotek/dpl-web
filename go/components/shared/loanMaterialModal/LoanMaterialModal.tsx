import { useQueryClient } from "@tanstack/react-query"
import { first } from "lodash"
import React, { useState } from "react"

import {
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
} from "@/components/pages/workPageLayout/helper"
import AlertBox from "@/components/shared/alertBox/AlertBox"
import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { Button } from "@/components/shared/button/Button"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import Icon from "@/components/shared/icon/Icon"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import { cyKeys } from "@/cypress/support/constants"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"
import { getGetV1UserLoansAdapterQueryKey } from "@/lib/rest/publizon/adapter/generated/publizon"
import { ApiResponseCode } from "@/lib/rest/publizon/local-adapter/generated/model"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"
import usePostV1UserLoansIdentifier from "@/lib/rest/publizon/usePostV1UserLoansIdentifier"

import { publizonErrorMessageMap } from "./helper"

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
  const manifestation = data?.work?.manifestations?.all?.find(m => m.pid === pid)
  const { mutate } = usePostV1UserLoansIdentifier()
  const { data: loansData, isLoading: isLoadingLoans } = useGetV1UserLoans()
  const [isHandlingLoan, setIsHandlingLoan] = useState(false)
  const [publizonError, setPublizonError] = useState<{
    code: ApiResponseCode
    message: string
  } | null>(null)

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
          if (error instanceof Error) {
            const errorData = JSON.parse(error.message)
            setPublizonError(errorData)
            setIsHandlingLoan(false)
          }
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
          <>
            <div
              className="rounded-base relative flex aspect-1/1 h-36 w-full flex-col items-center
                justify-center lg:aspect-4/5">
              <CoverPicture alt="Forsidebillede på værket" covers={manifestation.cover} />
              <MaterialTypeIconWrapper
                iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
                className="bg-background absolute -bottom-6 h-10 w-10 outline-1"
              />
            </div>

            <div className="mx-auto mt-10 mb-5 w-full max-w-prose space-y-4">
              <p className="text-typo-subtitle-md text-center">
                {`Er du sikker på, at du vil låne materialet${` (${getManifestationLabel(manifestation)})?` || "?"}`}
              </p>
              {isAlreadyLoaned && (
                <AlertBox
                  variant="warning"
                  message={`Du har allerede lånt denne ${getManifestationLabel(manifestation)}. Find den på Min side.`}
                />
              )}
              {publizonError && <AlertBox message={publizonErrorMessageMap[publizonError.code]} />}
            </div>

            <div className="flex flex-row items-center justify-center gap-6">
              {!isAlreadyLoaned && !publizonError && (
                <Button
                  theme={"primary"}
                  size={"lg"}
                  data-cy={cyKeys["approve-loan-button"]}
                  onClick={handleLoanMaterial}
                  disabled={isHandlingLoan || isLoadingLoans}>
                  {!isHandlingLoan && "Ja"}
                  {isHandlingLoan && (
                    <Icon
                      name="go-spinner"
                      ariaLabel="Indlæser"
                      className="animate-spin-reverse h-[24px] w-[24px]"
                    />
                  )}
                </Button>
              )}
              <Button
                size={"lg"}
                disabled={isHandlingLoan || isLoadingLoans}
                onClick={() => onClose()}>
                {!isHandlingLoan && (publizonError || isAlreadyLoaned ? "Luk" : "Nej")}
                {isHandlingLoan && (
                  <Icon
                    name="go-spinner"
                    ariaLabel="Indlæser"
                    className="animate-spin-reverse h-[24px] w-[24px]"
                  />
                )}
              </Button>
            </div>
          </>
        )}
      </AnimateChangeInHeight>
    </ResponsiveDialog>
  )
}

export default LoanMaterialModal
