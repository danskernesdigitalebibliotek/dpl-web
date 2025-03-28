import { isManifestationPodcast } from "@/components/pages/workPageLayout/helper"
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
  return (
    <ResponsiveDialog
      open={open}
      title={`Prøv ${isManifestationPodcast(manifestation) ? "Podcast" : "Lydbog"}`}>
      <Player type="preview" identifier={manifestation.identifiers[0].value} />
    </ResponsiveDialog>
  )
}

export default PlayerPreviewModal
