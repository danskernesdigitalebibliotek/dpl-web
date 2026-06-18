"use client"

import React from "react"

import {
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
} from "@/components/pages/workPageLayout/helper"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { cyKeys } from "@/cypress/support/constants"
import type { GetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"

type Manifestation = NonNullable<
  NonNullable<GetMaterialQuery["work"]>["manifestations"]["all"]
>[number]

const LoanAlreadyLoanedContent = ({ manifestation }: { manifestation: Manifestation }) => {
  const label = getManifestationLabel(manifestation)

  return (
    <div
      data-cy={cyKeys["loan-already-loaned"]}
      className="mx-auto flex max-w-prose flex-col items-center gap-y-8 text-center">
      <ManifestationCover
        cover={manifestation.cover}
        iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
        className="aspect-[4/5] w-32 shrink-0"
      />
      <div className="flex flex-col gap-y-4">
        <h2 className="text-typo-heading-4 mt-2">Du har allerede lånt denne {label}</h2>
        <p className="text-typo-subtitle-md text-foreground-muted">Find den på Min side.</p>
      </div>
    </div>
  )
}

export default LoanAlreadyLoanedContent
