"use client"

import React from "react"

import { getManifestationMaterialTypeIcon } from "@/components/pages/workPageLayout/helper"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { cyKeys } from "@/cypress/support/constants"
import type { GetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import type { ApiResponseCode } from "@/lib/rest/publizon/local-adapter/generated/model"

import { publizonErrorMessageMap } from "./helper"

type Manifestation = NonNullable<
  NonNullable<GetMaterialQuery["work"]>["manifestations"]["all"]
>[number]

type LoanErrorProps = {
  manifestation: Manifestation
  code: ApiResponseCode
}

const GENERIC = "Lånet kunne ikke gennemføres. Prøv igen senere."

const LoanErrorContent = ({ manifestation, code }: LoanErrorProps) => {
  const message = publizonErrorMessageMap[code] ?? GENERIC

  return (
    <div
      data-cy={cyKeys["loan-error"]}
      data-code={code}
      className="mx-auto flex max-w-prose flex-col items-center gap-y-8 text-center">
      <ManifestationCover
        cover={manifestation.cover}
        iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
        className="aspect-[4/5] w-32 shrink-0"
      />
      <div className="flex flex-col gap-y-4">
        <h2 className="text-typo-heading-4 mt-2">Lånet kunne ikke gennemføres</h2>
        <p className="text-typo-subtitle-md text-foreground-muted">{message}</p>
      </div>
    </div>
  )
}

export default LoanErrorContent
