import { getManifestationLabel } from "@/components/pages/workPageLayout/helper"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { findManifestationByPid } from "@/lib/helpers/helper.manifestation"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"

import Player from "../publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "../responsiveDialog/ResponsiveDialog"

function PlayerPreviewModal({
  open,
  onClose,
  wid,
  pid,
}: {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}) {
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const manifestation = findManifestationByPid(data?.work, pid)
  const identifier = getPublizonIdentifierFromManifestation(manifestation)

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={`Prøv ${(manifestation && getManifestationLabel(manifestation)) || ""}`}>
      {manifestation && <Player type="preview" identifier={identifier || ""} />}
    </ResponsiveDialog>
  )
}

export default PlayerPreviewModal
