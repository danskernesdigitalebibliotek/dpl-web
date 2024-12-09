"use client"

import React from "react"

import Reader from "@/components/shared/publizonReader/PublizonReader"

function Page({ searchParams: { id } }: { searchParams: { id: string } }) {
  const handleBack = () => {
    window.history.back()
  }

  return (
    <div className="absolute inset-0 h-screen w-screen">
      <div className="absolute h-full w-full bg-reader-grey"></div>
      <Reader onBackCallback={() => handleBack()} type="demo" identifier={id} />
    </div>
  )
}

export default Page
