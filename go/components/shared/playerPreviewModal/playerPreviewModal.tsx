import { getManifestationLabel } from "@/components/pages/workPageLayout/helper"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"

import Player from "../publizonPlayer/PublizonPlayer"

// Data props — the caller holds the manifestation to preview.
export type PlayerPreviewModalProps = {
  manifestation: ManifestationWorkPageFragment
}

function PlayerPreviewModal({
  open,
  onClose,
  manifestation,
}: PlayerPreviewModalProps & { open: boolean; onClose: () => void }) {
  const identifier = getPublizonIdentifierFromManifestation(manifestation)

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={`Prøv ${getManifestationLabel(manifestation) || ""}`}>
      {identifier && <Player type="preview" identifier={identifier} />}
    </ResponsiveDialog>
  )
}

export default PlayerPreviewModal
