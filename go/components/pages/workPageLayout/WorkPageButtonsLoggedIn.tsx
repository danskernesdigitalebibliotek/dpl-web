import { useAvailability } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { first } from "lodash"
import { useQueryStates } from "nuqs"
import React, { useMemo } from "react"

import {
  getManifestationLabel,
  isAudioMaterialType,
  isEbookMaterialType,
  isPhysicalMaterialType,
  isPodcastMaterialType,
} from "@/components/pages/workPageLayout/helper"
import AlertBox from "@/components/shared/alertBox/AlertBox"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { convertPidToFaustId } from "@/lib/helpers/ids"
import { modalParsers } from "@/lib/helpers/modal-url"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"

import WorkPageButton from "./WorkPageButton"
import WorkPageButtons from "./WorkPageButtons"

export type WorkPageButtonsLoggedInProps = {
  workId: string
  selectedManifestation: ManifestationWorkPageFragment
}

const WorkPageButtonsLoggedIn = ({
  workId,
  selectedManifestation,
}: WorkPageButtonsLoggedInProps) => {
  const identifier = first(selectedManifestation?.identifiers)?.value
  const [, setModal] = useQueryStates(modalParsers, { scroll: false })

  const { data: dataLoans, isLoading: isLoadingLoans, isError: isErrorLoans } = useGetV1UserLoans()

  const materialTypeCode = selectedManifestation?.materialTypes[0]?.materialTypeSpecific.code
  const isPhysical = isPhysicalMaterialType(materialTypeCode)
  // Only run the FBS availability query for physical materials. Passing an
  // empty faustIds array makes useAvailability stay disabled.
  const faustId = isPhysical ? convertPidToFaustId(selectedManifestation.pid) : null
  const { data: availability, isLoading: isLoadingAvailability } = useAvailability({
    faustIds: faustId ? [faustId] : [],
  })

  const isLoanButtonDisabled = isLoadingLoans || isErrorLoans || !identifier
  const loan = useMemo(() => {
    return dataLoans?.loans?.find(loan => {
      return loan.libraryBook?.identifier === identifier
    })
  }, [dataLoans?.loans, identifier])
  const isLoaned = !!loan

  if (isLoadingLoans) {
    return (
      <WorkPageButtons>
        <div className="bg-background-skeleton h-12 w-full animate-pulse rounded-full lg:w-80" />
        <div className="bg-background-skeleton h-12 w-full animate-pulse rounded-full lg:w-80" />
      </WorkPageButtons>
    )
  }

  const label = getManifestationLabel(selectedManifestation)

  if (isPhysical) {
    if (isLoadingAvailability) {
      return (
        <WorkPageButtons>
          <div className="bg-background-skeleton h-12 w-full animate-pulse rounded-full lg:w-80" />
        </WorkPageButtons>
      )
    }

    const isReservable = availability?.some(a => a.isReservable) ?? false

    if (!isReservable) {
      return (
        <AlertBox
          message={`Dette er en fysisk ${label}. Den kan lånes på dit lokale bibliotek`}
          variant="warning"
        />
      )
    }

    return (
      <WorkPageButtons>
        <WorkPageButton
          ariaLabel={`Reservér ${label}`}
          theme={"primary"}
          onClick={() =>
            setModal({
              modal: "ReservationModal",
              modalProps: { wid: workId, pid: selectedManifestation.pid },
            })
          }>
          Reservér {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  if (isEbookMaterialType(materialTypeCode)) {
    const previewUrl = resolveUrl({
      routeParams: { work: "work", ":wid": workId, read: "read" },
      queryParams: { id: identifier || "" },
    })

    const loanUrl = resolveUrl({
      routeParams: { work: "work", ":wid": workId, read: "read" },
      queryParams: { orderId: loan?.orderId || "" },
    })

    if (isLoaned) {
      return (
        <WorkPageButtons>
          <WorkPageButton ariaLabel={`Læs ${label}`} theme={"primary"} asChild>
            <SmartLink href={loanUrl}>Læs {label}</SmartLink>
          </WorkPageButton>
        </WorkPageButtons>
      )
    }

    return (
      <WorkPageButtons>
        <WorkPageButton ariaLabel={`Prøv ${label}`} asChild disabled={isLoanButtonDisabled}>
          <SmartLink href={previewUrl}>Prøv {label}</SmartLink>
        </WorkPageButton>
        <WorkPageButton
          ariaLabel={`Lån ${label}`}
          theme={"primary"}
          disabled={isLoanButtonDisabled}
          onClick={() =>
            setModal({
              modal: "LoanMaterialModal",
              modalProps: { wid: workId, pid: selectedManifestation.pid },
            })
          }>
          Lån {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  if (isAudioMaterialType(materialTypeCode) || isPodcastMaterialType(materialTypeCode)) {
    if (isLoaned) {
      return (
        <WorkPageButtons>
          <WorkPageButton
            ariaLabel={`Lyt til ${label}`}
            theme={"primary"}
            disabled={isLoanButtonDisabled}
            onClick={() =>
              setModal({
                modal: "PlayerModal",
                modalProps: { wid: workId, pid: selectedManifestation.pid },
              })
            }>
            Lyt til {label}
          </WorkPageButton>
        </WorkPageButtons>
      )
    }

    return (
      <WorkPageButtons>
        <WorkPageButton
          ariaLabel={`Prøv ${label}`}
          disabled={isLoanButtonDisabled}
          onClick={() =>
            setModal({
              modal: "PlayerPreviewModal",
              modalProps: { wid: workId, pid: selectedManifestation.pid },
            })
          }>
          Prøv {label}
        </WorkPageButton>
        <WorkPageButton
          ariaLabel={`Lån ${label}`}
          theme={"primary"}
          disabled={isLoanButtonDisabled}
          onClick={() =>
            setModal({
              modal: "LoanMaterialModal",
              modalProps: { wid: workId, pid: selectedManifestation.pid },
            })
          }>
          Lån {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }
}

export default WorkPageButtonsLoggedIn
