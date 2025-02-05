"use client"

import { useSearchParams } from "next/navigation"
import React from "react"

import Reader from "@/components/shared/publizonReader/PublizonReader"

function Page() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const handleBack = () => {
    window.history.back()
  }

  // TODO: Do we want to do this if there is no id?
  if (!id) {
    return null
  }

  return (
    <div className="absolute inset-0 h-screen w-screen">
      <div className="bg-reader-grey absolute h-full w-full"></div>
      <Reader onBackCallback={() => handleBack()} type="demo" identifier={id} />
    </div>
  )
}

export default Page
