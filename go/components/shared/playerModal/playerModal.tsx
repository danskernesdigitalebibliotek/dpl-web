import { isManifestationPodcast } from "@/components/pages/workPageLayout/helper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

import Player from "../publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "../responsiveDialog/ResponsiveDialog"

function PlayerModal({
  open,
  manifestation,
  orderId,
}: {
  open: boolean
  manifestation: ManifestationWorkPageFragment
  orderId: string
}) {
  return (
    <ResponsiveDialog
      open={open}
      title={`Lyt til ${isManifestationPodcast(manifestation) ? "Podcast" : "Lydbog"}`}>
      <Player type="loan" orderId={orderId} />
    </ResponsiveDialog>
  )
}

export default PlayerModal
