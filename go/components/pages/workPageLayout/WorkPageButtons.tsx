import React, { useMemo } from "react"

import {
  isManifestationAudioBook,
  isManifestationBook,
  isManifestationEbook,
  isManifestationPodcast,
} from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import useSession from "@/hooks/useSession"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"
import { modalStore } from "@/store/modal.store"
import { sheetStore } from "@/store/sheet.store"

export type WorkPageButtonsProps = {
  workId: string
  selectedManifestation: ManifestationWorkPageFragment
}

const WorkPageButtons = ({ workId, selectedManifestation }: WorkPageButtonsProps) => {
  const identifier = selectedManifestation?.identifiers[0].value
  const { data: dataLoans, isLoading: isLoadingLoans, isError: isErrorLoans } = useGetV1UserLoans()
  const isLoanButtonDisabled = isLoadingLoans || isErrorLoans
  const loan = useMemo(() => {
    return dataLoans?.loans?.find(loan => {
      return loan.libraryBook?.identifier === identifier
    })
  }, [dataLoans?.loans, identifier])
  const isLoaned = !!loan
  const { openModal } = modalStore.trigger
  const { session } = useSession()
  const isLoggedIn = session?.isLoggedIn || false
  const { openSheet } = sheetStore.trigger

  if (isLoadingLoans) {
    return (
      <>
        <div className="bg-background-skeleton mb-grid-gap-half h-12 w-full animate-pulse rounded-full lg:w-80" />
        <div className="bg-background-skeleton h-12 w-full animate-pulse rounded-full lg:w-80" />
      </>
    )
  }

  if (isManifestationBook(selectedManifestation))
    return (
      <div className="bg-background-overlay relative mr-auto flex items-center gap-4 rounded-md p-8 lg:mr-0 lg:w-auto">
        <Icon className={cn("top-4 left-4 h-5 w-5")} name="alert" />
        <h3 className="text-typo-link w-full">Bogen kan lånes på dit bibliotek</h3>
      </div>
    )

  if (isManifestationEbook(selectedManifestation)) {
    const previewUrl = resolveUrl({
      routeParams: { work: "work", ":wid": workId, read: "read" },
      queryParams: { id: identifier || "" },
    })

    const loanUrl = resolveUrl({
      routeParams: { work: "work", ":wid": workId, read: "read" },
      queryParams: { orderId: loan?.orderId || "" },
    })

    if (!isLoaned)
      return (
        <>
          <Button
            ariaLabel="Prøv e-bog"
            size={"lg"}
            className="mb-grid-gap-half w-full lg:max-w-80 lg:min-w-72"
            asChild
            disabled={!!identifier}>
            <SmartLink linkType="external" href={previewUrl}>
              Prøv e-bog
            </SmartLink>
          </Button>
          <Button
            ariaLabel={"Lån e-bog"}
            size={"lg"}
            className="w-full lg:max-w-80 lg:min-w-72"
            theme={"primary"}
            disabled={isLoanButtonDisabled}
            onClick={() => {
              if (isLoggedIn) {
                openModal({
                  modalType: "LoanMaterialModal",
                  props: {
                    manifestation: selectedManifestation,
                  },
                })
              } else {
                openSheet({
                  sheetType: "LoginSheet",
                })
              }
            }}>
            Lån e-bog
          </Button>
        </>
      )

    if (isLoaned)
      return (
        <Button
          ariaLabel="Læs e-bog"
          size={"lg"}
          className="w-full lg:max-w-80 lg:min-w-72"
          asChild>
          <SmartLink linkType="external" href={loanUrl}>
            Læs e-bog
          </SmartLink>
        </Button>
      )
  }

  if (isManifestationAudioBook(selectedManifestation)) {
    return (
      <>
        {!isLoaned && (
          <>
            <Button
              ariaLabel="Prøv lydbog"
              size={"lg"}
              disabled={!Boolean(identifier)}
              className="mb-grid-gap-half w-full lg:max-w-80 lg:min-w-72"
              onClick={() =>
                openModal({
                  modalType: "PlayerPreviewModal",
                  props: { manifestation: selectedManifestation },
                })
              }>
              Prøv lydbog
            </Button>
            <Button
              ariaLabel="Lån lydbog"
              size={"lg"}
              className="w-full lg:max-w-80 lg:min-w-72"
              theme={"primary"}
              disabled={isLoanButtonDisabled}
              onClick={() => {
                if (isLoggedIn) {
                  openModal({
                    modalType: "LoanMaterialModal",
                    props: {
                      manifestation: selectedManifestation,
                    },
                  })
                } else {
                  openSheet({
                    sheetType: "LoginSheet",
                  })
                }
              }}>
              Lån lydbog
            </Button>
          </>
        )}

        {isLoaned && (
          <Button
            ariaLabel="Lyt til lydbog"
            size={"lg"}
            className="w-full lg:max-w-80 lg:min-w-72"
            onClick={() =>
              openModal({
                modalType: "PlayerModal",
                props: { manifestation: selectedManifestation, orderId: loan?.orderId },
              })
            }>
            Lyt til lydbog
          </Button>
        )}
      </>
    )
  }

  if (isManifestationPodcast(selectedManifestation)) {
    return (
      <>
        {!isLoaned && (
          <>
            <Button
              ariaLabel="Prøv podcast"
              size={"lg"}
              disabled={!Boolean(identifier)}
              className="mb-grid-gap-half w-full lg:max-w-80 lg:min-w-72"
              onClick={() =>
                openModal({
                  modalType: "PlayerPreviewModal",
                  props: { manifestation: selectedManifestation },
                })
              }>
              Prøv podcast
            </Button>
            <Button
              ariaLabel="Lån podcast"
              size={"lg"}
              className="w-full lg:max-w-80 lg:min-w-72"
              disabled={isLoanButtonDisabled}
              onClick={() => {
                if (isLoggedIn) {
                  openModal({
                    modalType: "LoanMaterialModal",
                    props: { manifestation: selectedManifestation },
                  })
                } else {
                  openSheet({
                    sheetType: "LoginSheet",
                  })
                }
              }}>
              Lån podcast
            </Button>
          </>
        )}
        {isLoaned && (
          <Button
            ariaLabel="Lyt til podcast"
            size={"lg"}
            className="w-full lg:max-w-80 lg:min-w-72"
            onClick={() =>
              openModal({
                modalType: "PlayerModal",
                props: { manifestation: selectedManifestation, orderId: loan?.orderId },
              })
            }>
            Lyt til podcast
          </Button>
        )}
      </>
    )
  }
}

export default WorkPageButtons
