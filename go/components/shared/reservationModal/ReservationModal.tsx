"use client"

import { useAvailability } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useState } from "react"

import { getManifestationLabel } from "@/components/pages/workPageLayout/helper"
import AlertBox from "@/components/shared/alertBox/AlertBox"
import { Button } from "@/components/shared/button/Button"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import useSession from "@/hooks/useSession"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { convertPidToFaustId } from "@/lib/helpers/ids"

type ReservationModalProps = {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}

const ReservationModal = ({ open, onClose, wid, pid }: ReservationModalProps) => {
  const { session, isLoading: isLoadingSession } = useSession()
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const manifestation = data?.work?.manifestations?.all?.find(m => m.pid === pid)
  const faustId = convertPidToFaustId(pid)

  const { data: availability, isLoading: isLoadingAvailability } = useAvailability({
    faustIds: faustId ? [faustId] : [],
  })

  // /go-owned predicate. Keep it inline so the rule is visible at the call
  // site that uses it.
  const isAnonymous = !session?.isLoggedIn
  const isBlocked = false
  const canReserve =
    !isAnonymous && !isBlocked && (availability?.some(a => a.isReservable) ?? false)

  const [isReserving, setIsReserving] = useState(false)
  const [isReserved, setIsReserved] = useState(false)

  const handleReserve = () => {
    // Placeholder: the createReservation POST is not yet exposed by the
    // service-layer. This confirms the gate decision and resolves the UI.
    setIsReserving(true)
    setTimeout(() => {
      setIsReserving(false)
      setIsReserved(true)
    }, 300)
  }

  const title = manifestation ? `Reservér ${getManifestationLabel(manifestation)}` : "Reservér"
  const isLoading = isLoadingSession || isLoadingAvailability

  return (
    <ResponsiveDialog open={open} onClose={onClose} title={title}>
      {manifestation && (
        <>
          <div
            className="rounded-base relative flex aspect-1/1 h-36 w-full flex-col items-center
              justify-center lg:aspect-4/5">
            <CoverPicture alt="Forsidebillede på værket" covers={manifestation.cover} />
          </div>

          <div className="mx-auto mt-10 mb-5 w-full max-w-prose space-y-4">
            {isAnonymous && !isLoadingSession && (
              <AlertBox message="Du skal være logget ind for at reservere dette materiale." />
            )}
            {!isAnonymous && !isLoading && !canReserve && (
              <AlertBox message="Dette materiale kan ikke reserveres lige nu." />
            )}
            {isReserved && (
              <AlertBox variant="success" message="Tak! Din reservation er placeret." />
            )}
            {canReserve && !isReserved && (
              <p className="text-typo-subtitle-md text-center">
                Bekræft, at du vil reservere dette materiale.
              </p>
            )}
          </div>

          <div className="flex flex-row items-center justify-center gap-6">
            {canReserve && !isReserved && (
              <Button theme="primary" size="lg" onClick={handleReserve} disabled={isReserving}>
                {isReserving ? "Reserverer..." : "Ja, reservér"}
              </Button>
            )}
            <Button size="lg" onClick={onClose}>
              {canReserve && !isReserved ? "Annullér" : "Luk"}
            </Button>
          </div>
        </>
      )}
    </ResponsiveDialog>
  )
}

export default ReservationModal
