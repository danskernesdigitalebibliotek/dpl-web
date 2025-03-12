import React, { useMemo, useState } from "react"

import {
  getManifestationMaterialTypeIcon,
  getManifestationMaterialTypeSpecific,
  isManifestationAudioBook,
  isManifestationEbook,
  isManifestationPodcast,
} from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import { CoverPicture, CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import Player from "@/components/shared/publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/helper.covers"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"

export type WorkPageButtonsProps = {
  workId: string
  selectedManifestation: ManifestationWorkPageFragment
}

const WorkPageButtons = ({ workId, selectedManifestation }: WorkPageButtonsProps) => {
  const identifier = selectedManifestation?.identifiers[0].value
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const url = resolveUrl({
    routeParams: { work: "work", ":wid": workId, read: "read" },
    queryParams: { id: identifier || "" },
  })
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const getV1UserLoans = useGetV1UserLoans()
  const { data: dataLoans, isLoading: isLoadingLoans, isError: isErrorLoans } = getV1UserLoans()
  const isLoanButtonDisabled = isLoadingLoans || isErrorLoans
  const isLoaned = useMemo(() => {
    return dataLoans?.loans?.some(loan => loan.libraryBook?.identifier === identifier)
  }, [dataLoans?.loans, identifier])
  const { data: dataCovers, isLoading: isLoadingCovers } = useGetCoverCollection(
    {
      type: "pid",
      // This is always a string - query is disabled when selectedManifestation is false-y
      identifiers: [selectedManifestation?.pid as string],
      sizes: [
        "xx-small, small, small-medium, medium, medium-large, large, original, default" as GetCoverCollectionSizesItem,
      ],
    },
    { query: { enabled: !!selectedManifestation?.pid } }
  )
  const lowResCover = getLowResCoverUrl(dataCovers)
  const coverSrc = getCoverUrls(
    dataCovers,
    selectedManifestation?.pid ? [selectedManifestation.pid] : undefined,
    ["default", "original", "large", "medium-large", "medium", "small-medium", "small", "xx-small"]
  )

  if (isLoadingLoans) {
    return (
      <>
        <div className="bg-background-skeleton mb-grid-gap-half h-10 w-full animate-pulse rounded-full lg:w-80" />
        <div className="bg-background-skeleton h-10 w-full animate-pulse rounded-full lg:w-80" />
      </>
    )
  }

  return (
    <>
      {isManifestationEbook(selectedManifestation) && (
        <>
          {!isLoaned && (
            <Button
              ariaLabel="Prøv e-bog"
              size={"lg"}
              className="mb-grid-gap-half w-full lg:max-w-80 lg:min-w-72"
              asChild
              disabled={!!identifier}>
              <SmartLink linkType="external" href={url}>
                Prøv e-bog
              </SmartLink>
            </Button>
          )}
          <Button
            ariaLabel={isLoaned ? "Læs e-bog" : "Lån e-bog"}
            size={"lg"}
            className="w-full lg:max-w-80 lg:min-w-72"
            theme={"primary"}
            disabled={isLoanButtonDisabled}
            onClick={() => !isLoaned && setIsConfirmDialogOpen(!isConfirmDialogOpen)}>
            {isLoaned ? "Læs e-bog" : "Lån e-bog"}
          </Button>
        </>
      )}
      {isManifestationAudioBook(selectedManifestation) && (
        <>
          <Button
            ariaLabel="Prøv lydbog"
            size={"lg"}
            disabled={!!!identifier}
            className="mb-grid-gap-half w-full lg:max-w-80 lg:min-w-72"
            onClick={() => setIsPlayerOpen(!isPlayerOpen)}>
            Prøv lydbog
          </Button>
          <Button
            ariaLabel={isLoaned ? "Læs lydbog" : "Lån lydbog"}
            size={"lg"}
            className="w-full lg:max-w-80 lg:min-w-72"
            theme={"primary"}
            disabled={isLoanButtonDisabled}
            onClick={() => !isLoaned && setIsConfirmDialogOpen(!isConfirmDialogOpen)}>
            {isLoaned ? "Læs lydbog" : "Lån lydbog"}
          </Button>
        </>
      )}
      {isManifestationPodcast(selectedManifestation) && (
        <>
          <Button
            ariaLabel="Prøv podcast"
            size={"lg"}
            disabled={!!!identifier}
            className="mb-grid-gap-half w-full lg:max-w-80 lg:min-w-72"
            onClick={() => setIsPlayerOpen(!isPlayerOpen)}>
            Prøv podcast
          </Button>
          <Button
            ariaLabel={isLoaned ? "Læs podcast" : "Hør podcast"}
            size={"lg"}
            className="w-full lg:max-w-80 lg:min-w-72"
            theme={"primary"}
            disabled={isLoanButtonDisabled}
            onClick={() => !isLoaned && setIsConfirmDialogOpen(!isConfirmDialogOpen)}>
            {isLoaned ? "Læs podcast" : "Hør podcast"}
          </Button>
        </>
      )}

      {/* Reader / Player dialog */}
      {!!selectedManifestation?.identifiers[0].value && (
        <ResponsiveDialog
          open={isPlayerOpen}
          onOpenChange={() => {
            setIsPlayerOpen(!isPlayerOpen)
          }}
          title={`Prøv ${isManifestationPodcast(selectedManifestation) ? "Podcast" : "Lydbog"}`}>
          <Player type="demo" identifier={selectedManifestation.identifiers[0].value} />
        </ResponsiveDialog>
      )}

      {/* "Are you sure?" dialog */}
      <ResponsiveDialog
        open={isConfirmDialogOpen}
        onOpenChange={() => {
          setIsConfirmDialogOpen(prev => !prev)
        }}
        title={`Lån ${getManifestationMaterialTypeSpecific(selectedManifestation) || "materialet"}`}>
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
            iconName={getManifestationMaterialTypeIcon(selectedManifestation)}
            className="bg-background absolute -bottom-6 h-10 w-10"
          />
        </div>
        <p className="text-typo-body-lg mt-10 w-full text-center lg:mt-5">
          Er du sikker på at du vil låne denne{" "}
          {getManifestationMaterialTypeSpecific(selectedManifestation) || "material"}?
        </p>
        <div className="flex flex-row items-center justify-center gap-6">
          <Button theme={"primary"} size={"lg"}>
            Ja
          </Button>
          <Button size={"lg"}>Nej</Button>
        </div>
      </ResponsiveDialog>
    </>
  )
}

export default WorkPageButtons
