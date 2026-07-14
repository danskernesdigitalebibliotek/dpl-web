import { getManifestationLabel } from "@/components/pages/workPageLayout/helper"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { findManifestationByPid } from "@/lib/helpers/helper.manifestation"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"

import Player from "../publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"

function PlayerModal({
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
  const { data: loansData } = useGetV1UserLoans()
  const identifier = getPublizonIdentifierFromManifestation(manifestation)
  const orderId = loansData?.loans?.find(
    loan => loan.libraryBook?.identifier === identifier
  )?.orderId

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={`Lyt til ${(manifestation && getManifestationLabel(manifestation)) || ""}`}>
      {manifestation && orderId && <Player type="loan" orderId={orderId} />}
    </ResponsiveDialog>
  )
}

export default PlayerModal
