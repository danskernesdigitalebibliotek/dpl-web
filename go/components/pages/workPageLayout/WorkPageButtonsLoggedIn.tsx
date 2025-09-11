import { first } from "lodash"
import React, { useMemo } from "react"

import {
  isManifestationAudioBook,
  isManifestationBook,
  isManifestationEbook,
  isManifestationPodcast,
} from "@/components/pages/workPageLayout/helper"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"
import { modalStore } from "@/store/modal.store"

import WorkPageButton from "./WorkPageButton"
import WorkPageButtons from "./WorkPageButtons"
import WorkPageInfoBox from "./WorkPageInfoBox"

export type WorkPageButtonsLoggedInProps = {
  workId: string
  selectedManifestation: ManifestationWorkPageFragment
}

const WorkPageButtonsLoggedIn = ({
  workId,
  selectedManifestation,
}: WorkPageButtonsLoggedInProps) => {
  const identifier = first(selectedManifestation?.identifiers)?.value

  const { data: dataLoans, isLoading: isLoadingLoans, isError: isErrorLoans } = useGetV1UserLoans()
  const isLoanButtonDisabled = isLoadingLoans || isErrorLoans || !identifier
  const loan = useMemo(() => {
    return dataLoans?.loans?.find(loan => {
      return loan.libraryBook?.identifier === identifier
    })
  }, [dataLoans?.loans, identifier])
  const isLoaned = !!loan

  const { openModal } = modalStore.trigger

  if (isLoadingLoans) {
    return (
      <WorkPageButtons>
        <div className="bg-background-skeleton h-12 w-full animate-pulse rounded-full lg:w-80" />
        <div className="bg-background-skeleton h-12 w-full animate-pulse rounded-full lg:w-80" />
      </WorkPageButtons>
    )
  }

  if (isManifestationBook(selectedManifestation))
    return <WorkPageInfoBox text="Dette er en fysisk bog. Den kan lånes på dit lokale bibliotek" />

  if (isManifestationEbook(selectedManifestation)) {
    const previewUrl = resolveUrl({
      routeParams: { work: "work", ":wid": workId, read: "read" },
      queryParams: { id: identifier || "" },
    })

    const loanUrl = resolveUrl({
      routeParams: { work: "work", ":wid": workId, read: "read" },
      queryParams: { orderId: loan?.orderId || "" },
    })

    if (!isLoaned) {
      return (
        <WorkPageButtons>
          <WorkPageButton ariaLabel="Prøv e-bog" asChild disabled={isLoanButtonDisabled}>
            <SmartLink linkType="external" href={previewUrl}>
              Prøv e-bog
            </SmartLink>
          </WorkPageButton>
          <WorkPageButton
            ariaLabel="Lån e-bog"
            theme={"primary"}
            disabled={isLoanButtonDisabled}
            onClick={() => {
              openModal({
                modalType: "LoanMaterialModal",
                props: {
                  manifestation: selectedManifestation,
                },
              })
            }}>
            Lån e-bog
          </WorkPageButton>
        </WorkPageButtons>
      )
    }
    if (isLoaned) {
      return (
        <WorkPageButtons>
          <WorkPageButton ariaLabel="Læs e-bog" theme={"primary"} asChild>
            <SmartLink linkType="external" href={loanUrl}>
              Læs e-bog
            </SmartLink>
          </WorkPageButton>
        </WorkPageButtons>
      )
    }
  }

  if (isManifestationAudioBook(selectedManifestation)) {
    if (!isLoaned) {
      return (
        <WorkPageButtons>
          <WorkPageButton
            ariaLabel="Prøv lydbog"
            disabled={isLoanButtonDisabled}
            onClick={() =>
              openModal({
                modalType: "PlayerPreviewModal",
                props: { manifestation: selectedManifestation },
              })
            }>
            Prøv lydbog
          </WorkPageButton>
          <WorkPageButton
            ariaLabel="Lån lydbog"
            theme={"primary"}
            disabled={isLoanButtonDisabled}
            onClick={() => {
              openModal({
                modalType: "LoanMaterialModal",
                props: {
                  manifestation: selectedManifestation,
                },
              })
            }}>
            Lån lydbog
          </WorkPageButton>
        </WorkPageButtons>
      )
    }
    if (isLoaned) {
      return (
        <WorkPageButtons>
          <WorkPageButton
            ariaLabel="Lyt til lydbog"
            theme={"primary"}
            disabled={isLoanButtonDisabled}
            onClick={() =>
              openModal({
                modalType: "PlayerModal",
                props: { manifestation: selectedManifestation, orderId: loan?.orderId },
              })
            }>
            Lyt til lydbog
          </WorkPageButton>
        </WorkPageButtons>
      )
    }
  }

  if (isManifestationPodcast(selectedManifestation)) {
    if (!isLoaned) {
      return (
        <WorkPageButtons>
          <WorkPageButton
            ariaLabel="Prøv podcast"
            disabled={isLoanButtonDisabled}
            onClick={() =>
              openModal({
                modalType: "PlayerPreviewModal",
                props: { manifestation: selectedManifestation },
              })
            }>
            Prøv podcast
          </WorkPageButton>
          <WorkPageButton
            ariaLabel="Lån podcast"
            theme={"primary"}
            disabled={isLoanButtonDisabled}
            onClick={() => {
              openModal({
                modalType: "LoanMaterialModal",
                props: { manifestation: selectedManifestation },
              })
            }}>
            Lån podcast
          </WorkPageButton>
        </WorkPageButtons>
      )
    } else {
      return (
        <WorkPageButtons>
          <WorkPageButton
            ariaLabel="Lyt til podcast"
            theme={"primary"}
            disabled={isLoanButtonDisabled}
            onClick={() =>
              openModal({
                modalType: "PlayerModal",
                props: { manifestation: selectedManifestation, orderId: loan?.orderId },
              })
            }>
            Lyt til podcast
          </WorkPageButton>
        </WorkPageButtons>
      )
    }
  }
}

export default WorkPageButtonsLoggedIn
