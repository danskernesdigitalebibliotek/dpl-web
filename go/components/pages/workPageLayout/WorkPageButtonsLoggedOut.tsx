import { first } from "lodash"
import { usePathname, useSearchParams } from "next/navigation"
import { useQueryStates } from "nuqs"
import React from "react"

import {
  getManifestationLabel,
  isAudioMaterialType,
  isEbookMaterialType,
  isPhysicalMaterialType,
  isPodcastMaterialType,
} from "@/components/pages/workPageLayout/helper"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { setLoginRedirectCookie } from "@/lib/helpers/login-redirect"
import { createModalUrl, modalParsers } from "@/lib/helpers/modal-url"
import { sheetStore } from "@/store/sheet.store"

import WorkPageButton from "./WorkPageButton"
import WorkPageButtons from "./WorkPageButtons"
import AlertBox from "@/components/shared/alertBox/AlertBox"

export type WorkPageButtonsLoggedOutProps = {
  workId: string
  selectedManifestation: ManifestationWorkPageFragment
}

const WorkPageButtonsLoggedOut = ({
  workId,
  selectedManifestation,
}: WorkPageButtonsLoggedOutProps) => {
  const identifier = first(selectedManifestation?.identifiers)?.value
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [, setModal] = useQueryStates(modalParsers, { scroll: false })

  const { openSheet } = sheetStore.trigger

  const materialTypeCode = selectedManifestation?.materialTypes[0]?.materialTypeSpecific.code
  const label = getManifestationLabel(selectedManifestation)

  const getLoanRedirectPath = () =>
    createModalUrl(`${pathname}?${searchParams}`, {
      modal: "LoanMaterialModal",
      modalProps: { wid: workId, pid: selectedManifestation.pid },
    })

  if (isPhysicalMaterialType(materialTypeCode)) {
    return (
      <AlertBox
        message={`Dette er en fysisk ${label}. Den kan lånes på dit lokale bibliotek`}
        variant="warning"
      />
    )
  }

  if (isEbookMaterialType(materialTypeCode)) {
    const previewUrl = resolveUrl({
      routeParams: { work: "work", ":wid": workId, read: "read" },
      queryParams: { id: identifier || "" },
    })

    return (
      <WorkPageButtons>
        <WorkPageButton ariaLabel={`Prøv ${label}`} asChild disabled={!identifier}>
          <SmartLink linkType="external" href={previewUrl}>
            Prøv {label}
          </SmartLink>
        </WorkPageButton>
        <WorkPageButton
          ariaLabel={`Lån ${label}`}
          theme={"primary"}
          disabled={!identifier}
          onClick={() => {
            openSheet({
              sheetType: "LoginSheet",
              props: { onLogin: () => setLoginRedirectCookie(getLoanRedirectPath()) },
            })
          }}>
          Lån {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  if (isAudioMaterialType(materialTypeCode) || isPodcastMaterialType(materialTypeCode)) {
    return (
      <WorkPageButtons>
        <WorkPageButton
          ariaLabel={`Prøv ${label}`}
          disabled={!identifier}
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
          disabled={!identifier}
          onClick={() => {
            openSheet({
              sheetType: "LoginSheet",
              props: { onLogin: () => setLoginRedirectCookie(getLoanRedirectPath()) },
            })
          }}>
          Lån {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }
}

export default WorkPageButtonsLoggedOut
