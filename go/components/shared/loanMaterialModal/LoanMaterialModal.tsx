import { useQueryClient } from "@tanstack/react-query"
import React, { useState } from "react"

import {
  canUserLoanMoreCostFreeMaterials,
  canUserLoanMoreMaterials,
  getManifestationMaterialTypeIcon,
  getManifestationMaterialTypeSpecific,
  isManifestationPodcast,
} from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import { CoverPicture, CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import Icon from "@/components/shared/icon/Icon"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/helper.covers"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import { useGetV1ProductsIdentifierAdapter } from "@/lib/rest/publizon/adapter/generated/publizon"
import { ApiResponseCode } from "@/lib/rest/publizon/local-adapter/generated/model"
import useGetV1LibraryProfile from "@/lib/rest/publizon/useGetV1LibraryProfile"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"
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
  const { data: dataCovers, isLoading: isLoadingCovers } = useGetCoverCollection(
    {
      type: "pid",
      // This is always a string - query is disabled when selectedManifestation is false-y
      identifiers: [manifestation.pid as string],
      sizes: [
        "xx-small, small, small-medium, medium, medium-large, large, original, default" as GetCoverCollectionSizesItem,
      ],
    },
    { query: { enabled: !!manifestation.pid } }
  )
  const lowResCover = getLowResCoverUrl(dataCovers)
  const coverSrc = getCoverUrls(dataCovers, manifestation?.pid ? [manifestation.pid] : undefined, [
    "default",
    "original",
    "large",
    "medium-large",
    "medium",
    "small-medium",
    "small",
    "xx-small",
  ])
  const { data: dataLoans, isLoading: isLoadingLoans, isError: isErrorLoans } = useGetV1UserLoans()
  const {
    data: dataLibraryProfile,
    isLoading: isLoadingLibraryProfile,
    isError: isErrorLibraryProfile,
  } = useGetV1LibraryProfile()
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
          queryClient.invalidateQueries({ queryKey: ["/v1/user/loans"] })
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

  const { data: publizonData } = useGetV1ProductsIdentifierAdapter(isbns?.[0], {
    // Publizon / useGetV1ProductsIdentifier is responsible for online
    // materials. It requires an ISBN to do lookups.
    enabled: isbns.length > 0,
  })

  const isCostFree = publizonData?.product?.costFree || isManifestationPodcast(manifestation)
  // Check if the user can loan more e-materials or if the material is cost-free (blue title or podcast)
  const isLoanPossible =
    (isCostFree && canUserLoanMoreCostFreeMaterials(dataLoans)) ||
    canUserLoanMoreMaterials(dataLoans, dataLibraryProfile, manifestation)

  const errors: string[] = []
  if (!isLoanPossible) {
    errors.push(
      `Du kan desværre ikke låne flere titler af typen "${getManifestationMaterialTypeSpecific(manifestation)}" i denne måned.`
    )
  }
  if (isErrorLoans || isErrorLibraryProfile) {
    errors.push(
      "Der sket desværre et fejl ved at checke om du kan låne materialet. Prøv igen senere."
    )
  }
  if (publizonError) {
    errors.push(publizonErrorMessageMap[publizonError.code] || publizonError.message)
  }

  const isLoading = isLoadingLibraryProfile || isLoadingLoans

  return (
    <ResponsiveDialog
      open={open}
      title={`Lån ${getManifestationMaterialTypeSpecific(manifestation) || "materialet"}`}>
      <div className="rounded-base relative flex aspect-1/1 h-36 w-full flex-col items-center justify-center lg:aspect-4/5">
        {isLoadingCovers && (
          <div className="aspect-1/1 h-36 lg:aspect-4/5">
            <CoverPictureSkeleton />
          </div>
        )}
        <CoverPicture
          alt="Forsidebillede på værket"
          lowResSrc={lowResCover || ""}
          src={coverSrc?.[0] || ""}
        />
        <MaterialTypeIconWrapper
          iconName={getManifestationMaterialTypeIcon(manifestation)}
          className="bg-background absolute -bottom-6 h-10 w-10 outline-1"
        />
      </div>

      {/* Description */}
      {isLoading && (
        <div className="bg-background-skeleton mx-auto mt-10 mb-5 h-[26px] w-[500px] animate-pulse rounded-full" />
      )}
      {!isLoading && (
        <div className="mx-auto mt-10 mb-5 w-full max-w-prose space-y-4">
          <p className="text-typo-subtitle-md text-center">
            {`Er du sikker på at du vil låne materialet${` (${getManifestationMaterialTypeSpecific(manifestation)})?` || "?"}`}
          </p>

          {errors.length > 0 && (
            <div className="flex">
              <div className="bg-error-red-100 text-error-red-400 rounded-base mx-auto flex items-center gap-4 p-4">
                <Icon className={cn("h-5 min-h-5 w-5 min-w-5")} name="alert" />
                <p className="text-typo-link">{errors[0]}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-row items-center justify-center gap-6">
        {/* Only show "approve loan" button if user can still loan more materials */}
        {!errors.length && (
          <Button
            theme={"primary"}
            size={"lg"}
            onClick={handleLoanMaterial}
            disabled={isHandlingLoan || isLoading}>
            {!isHandlingLoan && !isLoading && "Ja"}
            {(isHandlingLoan || isLoading) && (
              <Icon
                name="go-spinner"
                ariaLabel="Indlæser"
                className="animate-spin-reverse h-[24px] w-[24px]"
              />
            )}
          </Button>
        )}
        <Button size={"lg"} disabled={isHandlingLoan || isLoading} onClick={() => closeModal()}>
          {errors.length ? "Luk" : "Nej"}
          {isLoading && (
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
