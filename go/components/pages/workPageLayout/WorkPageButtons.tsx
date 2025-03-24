import React, { useMemo, useState } from "react"

import LoanMaterialModal from "@/components/pages/workPageLayout/LoanMaterialModal"
import {
  isManifestationAudioBook,
  isManifestationBook,
  isManifestationEbook,
  isManifestationPodcast,
} from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import Player from "@/components/shared/publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { resolveUrl } from "@/lib/helpers/helper.routes"
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
  const { data: dataLoans, isLoading: isLoadingLoans, isError: isErrorLoans } = useGetV1UserLoans()
  const isLoanButtonDisabled = isLoadingLoans || isErrorLoans
  const isLoaned = useMemo(() => {
    return dataLoans?.loans?.some(loan => loan.libraryBook?.identifier === identifier)
  }, [dataLoans?.loans, identifier])

  if (isLoadingLoans) {
    return (
      <>
        <div className="bg-background-skeleton mb-grid-gap-half h-12 w-full animate-pulse rounded-full lg:w-80" />
        <div className="bg-background-skeleton h-12 w-full animate-pulse rounded-full lg:w-80" />
      </>
    )
  }

  return (
    <>
      {isManifestationBook(selectedManifestation) && (
        <div className="bg-background-overlay relative mr-auto flex items-center gap-4 rounded-md p-8 lg:mr-0 lg:w-auto">
          <Icon className={cn("top-4 left-4 h-5 w-5")} name="alert" />
          <h3 className="text-typo-link w-full">Bogen kan lånes på dit bibliotek</h3>
        </div>
      )}
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
          {!isLoaned && (
            <Button
              ariaLabel="Prøv lydbog"
              size={"lg"}
              disabled={!Boolean(identifier)}
              className="mb-grid-gap-half w-full lg:max-w-80 lg:min-w-72"
              onClick={() => setIsPlayerOpen(!isPlayerOpen)}>
              Prøv lydbog
            </Button>
          )}
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
          {!isLoaned && (
            <Button
              ariaLabel="Prøv podcast"
              size={"lg"}
              disabled={!Boolean(identifier)}
              className="mb-grid-gap-half w-full lg:max-w-80 lg:min-w-72"
              onClick={() => setIsPlayerOpen(!isPlayerOpen)}>
              Prøv podcast
            </Button>
          )}
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
      <LoanMaterialModal
        isOpen={isConfirmDialogOpen}
        setIsOpen={setIsConfirmDialogOpen}
        manifestation={selectedManifestation}
      />
    </>
  )
}

export default WorkPageButtons
