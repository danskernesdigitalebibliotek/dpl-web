import { first } from "lodash"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
import { buildModalSearchParams } from "@/lib/helpers/modal-url"
import { sheetStore } from "@/store/sheet.store"

import WorkPageButton from "./WorkPageButton"
import WorkPageButtons from "./WorkPageButtons"
import WorkPageInfoBox from "./WorkPageInfoBox"

export type WorkPageButtonsLoggedOutProps = {
  workId: string
  selectedManifestation: ManifestationWorkPageFragment
}

const WorkPageButtonsLoggedOut = ({
  workId,
  selectedManifestation,
}: WorkPageButtonsLoggedOutProps) => {
  const identifier = first(selectedManifestation?.identifiers)?.value
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const { openSheet } = sheetStore.trigger

  const materialTypeCode = selectedManifestation?.materialTypes[0]?.materialTypeSpecific.code
  const label = getManifestationLabel(selectedManifestation)

  const getLoanRedirectPath = () => {
    const params = buildModalSearchParams(searchParams, "LoanMaterialModal", {
      wid: workId,
      pid: selectedManifestation.pid,
    })
    return `${pathname}?${params}`
  }

  if (isPhysicalMaterialType(materialTypeCode)) {
    return (
      <WorkPageInfoBox
        text={`Dette er en fysisk ${label}. Den kan lånes på dit lokale bibliotek`}
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
            router.push(
              `${pathname}?${buildModalSearchParams(searchParams, "PlayerPreviewModal", { wid: workId, pid: selectedManifestation.pid })}`
            )
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
