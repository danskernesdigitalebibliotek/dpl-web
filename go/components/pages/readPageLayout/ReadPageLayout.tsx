"use client"

import { notFound, useRouter, useSearchParams } from "next/navigation"
import React, { useEffect } from "react"

import Reader from "@/components/shared/publizonReader/PublizonReader"

function ReadPageLayout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const orderId = searchParams.get("orderId")

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

  if (!id && !orderId) {
    console.error("No id found in search params")
    return notFound()
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
