import React from "react"

import {
  getManifestationMaterialTypeIcon,
  getManifestationMaterialTypeSpecific,
} from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import { CoverPicture, CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/helper.covers"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import usePostV1UserLoansIdentifier from "@/lib/rest/publizon/usePostV1UserLoansIdentifier"

export type LoanMaterialModalProps = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  manifestation: ManifestationWorkPageFragment
}

const LoanMaterialModal = ({ isOpen, setIsOpen, manifestation }: LoanMaterialModalProps) => {
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
  const { mutate } = usePostV1UserLoansIdentifier()
  const isbns = getIsbnsFromManifestation(manifestation)
  const [isHandlingLoan, setIsHandlingLoan] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const handleLoanMaterial = () => {
    setIsHandlingLoan(true)
    mutate(
      { identifier: isbns[0] },
      {
        onSuccess: res => {
          setIsHandlingLoan(false)
          setIsOpen(false)
        },
        onError: err => {
          setError(err as Error)
          setIsHandlingLoan(false)
        },
      }
    )
  }

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(prev => !prev)
      }}
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
          className="bg-background absolute -bottom-6 h-10 w-10"
        />
      </div>
      <p className="text-typo-body-lg mt-10 mb-5 w-full text-center">
        {!error &&
          `Er du sikker på at du vil låne denne ${getManifestationMaterialTypeSpecific(manifestation) || "material"}?`}
        {error && "Vi kunne desværre ikke låne materialet. Prøv igen senere."}
      </p>
      <div className="flex flex-row items-center justify-center gap-6">
        <Button
          theme={"primary"}
          size={"lg"}
          onClick={handleLoanMaterial}
          disabled={isHandlingLoan}>
          {!isHandlingLoan && "Ja"}
          {isHandlingLoan && "Låner..."}
        </Button>
        <Button
          size={"lg"}
          onClick={() => {
            setIsOpen(prev => !prev)
          }}
          disabled={isHandlingLoan}>
          Nej
        </Button>
      </div>
    </ResponsiveDialog>
  )
}

export default LoanMaterialModal
