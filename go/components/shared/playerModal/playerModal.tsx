import { getManifestationLabel } from "@/components/pages/workPageLayout/helper"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

import Player from "../publizonPlayer/PublizonPlayer"

// Data props — the caller holds the loaned manifestation and its order id.
export type PlayerModalProps = {
  manifestation: ManifestationWorkPageFragment
  orderId?: string
}

function PlayerModal({
  open,
  onClose,
  manifestation,
  orderId,
}: PlayerModalProps & { open: boolean; onClose: () => void }) {
  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={`Lyt til ${getManifestationLabel(manifestation) || ""}`}>
      {orderId && <Player type="loan" orderId={orderId} />}
    </ResponsiveDialog>
  )
}

export default PlayerModal
