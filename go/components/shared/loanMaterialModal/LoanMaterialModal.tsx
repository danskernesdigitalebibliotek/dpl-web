import { useQueryClient } from "@tanstack/react-query"
import React, { useState } from "react"

import {
  getManifestationMaterialTypeIcon,
  getManifestationMaterialTypeSpecific,
} from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import Icon from "@/components/shared/icon/Icon"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import { cyKeys } from "@/cypress/support/constants"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"
import { getGetV1UserLoansAdapterQueryKey } from "@/lib/rest/publizon/adapter/generated/publizon"
import { ApiResponseCode } from "@/lib/rest/publizon/local-adapter/generated/model"
import usePostV1UserLoansIdentifier from "@/lib/rest/publizon/usePostV1UserLoansIdentifier"
import { modalStore } from "@/store/modal.store"

import { publizonErrorMessageMap } from "./helper"

const LoanMaterialModal = ({
  open,
  manifestation,
}: {
  open: boolean
  manifestation: ManifestationWorkPageFragment
}) => {
  const queryClient = useQueryClient()

  const { mutate } = usePostV1UserLoansIdentifier()
  const isbns = getIsbnsFromManifestation(manifestation)
  const [isHandlingLoan, setIsHandlingLoan] = useState(false)
  const [publizonError, setPublizonError] = useState<{
    code: ApiResponseCode
    message: string
  } | null>(null)
  const { closeModal } = modalStore.trigger
  const handleLoanMaterial = () => {
    setIsHandlingLoan(true)
    mutate(
      { identifier: isbns[0] },
      {
        onSuccess: () => {
          // Refetch data to update the UI for WorkPageButtons
          queryClient.invalidateQueries({ queryKey: getGetV1UserLoansAdapterQueryKey() })
          setIsHandlingLoan(false)
          closeModal()
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
      title={`Lån ${getManifestationMaterialTypeSpecific(manifestation) || "materialet"}`}>
      <div
        className="rounded-base relative flex aspect-1/1 h-36 w-full flex-col items-center
          justify-center lg:aspect-4/5">
        <CoverPicture alt="Forsidebillede på værket" covers={manifestation.cover} />
        <MaterialTypeIconWrapper
          iconName={getManifestationMaterialTypeIcon(manifestation)}
          className="bg-background absolute -bottom-6 h-10 w-10 outline-1"
        />
      </div>

      {/* Description */}
      <div className="mx-auto mt-10 mb-5 w-full max-w-prose space-y-4">
        <p className="text-typo-subtitle-md text-center">
          {`Er du sikker på, at du vil låne materialet${` (${getManifestationMaterialTypeSpecific(manifestation)})?` || "?"}`}
        </p>
        {publizonError && (
          <div className="flex">
            <div
              className="bg-error-red-100 text-error-red-400 rounded-base mx-auto flex items-center
                gap-4 p-4">
              <Icon className={cn("h-5 min-h-5 w-5 min-w-5")} name="alert" />
              <p className="text-typo-link">{publizonErrorMessageMap[publizonError.code]}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-row items-center justify-center gap-6">
        {/* Only show "approve loan" button if user can still loan more materials */}
        {!publizonError && (
          <Button
            theme={"primary"}
            size={"lg"}
            data-cy={cyKeys["approve-loan-button"]}
            onClick={handleLoanMaterial}
            disabled={isHandlingLoan}>
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
        <Button size={"lg"} disabled={isHandlingLoan} onClick={() => closeModal()}>
          {!isHandlingLoan && (publizonError ? "Luk" : "Nej")}
          {isHandlingLoan && (
            <Icon
              name="go-spinner"
              ariaLabel="Indlæser"
              className="animate-spin-reverse h-[24px] w-[24px]"
            />
          )}
        </Button>
      </div>
    </ResponsiveDialog>
  )
}

export default LoanMaterialModal
