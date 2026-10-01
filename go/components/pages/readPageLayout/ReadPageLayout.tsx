"use client"

import { notFound, useRouter, useSearchParams } from "next/navigation"
import React, { useEffect } from "react"

import DigitalReaderPlayer from "@/components/shared/digitalReaderPlayer/DigitalReaderPlayer"
import DigitalSampleReader from "@/components/shared/digitalReaderPlayer/DigitalSampleReader"
import Reader from "@/components/shared/publizonReader/PublizonReader"
import { useBiblioAdapter } from "@/hooks/useBiblioAdapter"

function ReadPageLayout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const orderId = searchParams.get("orderId")
  const loanId = searchParams.get("loanId")
  const viaBiblioAdapter = useBiblioAdapter()

  // Reset scroll so the full-viewport reader isn't left above the fold.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleBack = () => {
    // No in-app history (direct/shared link) — go to the frontpage, not a no-op back.
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  if (!id && !orderId && !loanId) {
    console.error("No id found in search params")
    return notFound()
  }

  // The loan decides the reader, not the flag: a Publizon loan (orderId) keeps
  // opening in pubhub's reader even after the switch to the Biblio adapter,
  // while a service layer loan (loanId) only exists once it is switched on.
  //
  // The WeDoBooks readers render bare, in normal page flow: this route lives
  // in the chrome-less (reader) group, so the SDK's own viewport sizing fills
  // the screen — the same footing the reader has in the CMS. The wrapper
  // below belongs to pubhub's reader alone.
  //
  // TODO(publizon-sunset): remove when the Publizon API is phased out — the
  // orderId/id params, PublizonReader and its wrapper go; only the loanId and
  // DigitalSampleReader branches remain (and `id` then always means a
  // WeDoBooks sample).
  if (loanId) {
    return <DigitalReaderPlayer loanId={loanId} onClose={() => handleBack()} />
  }

  if (id && viaBiblioAdapter) {
    return <DigitalSampleReader identifier={id} onClose={() => handleBack()} />
  }

  return (
    <div className="absolute inset-0 h-dvh w-screen">
      <div className="bg-reader-grey absolute h-full w-full"></div>

      {orderId && <Reader onBackCallback={() => handleBack()} type="loan" orderId={orderId} />}
      {id && <Reader onBackCallback={() => handleBack()} type="preview" identifier={id} />}
    </div>
  )
}

export default ReadPageLayout
