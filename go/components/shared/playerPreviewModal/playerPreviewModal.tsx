import { first } from "lodash"

import { getManifestationLabel } from "@/components/pages/workPageLayout/helper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

import Player from "../publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "../responsiveDialog/ResponsiveDialog"

function PlayerPreviewModal({
  open,
  manifestation,
}: {
  open: boolean
  manifestation: ManifestationWorkPageFragment
}) {
  const identifier = first(manifestation?.identifiers)?.value

  return (
    <ResponsiveDialog open={open} title={`Prøv ${getManifestationLabel(manifestation)}`}>
      <Player type="preview" identifier={identifier || ""} />
    </ResponsiveDialog>
  )
}

export default PlayerPreviewModal
