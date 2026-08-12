import React from "react"

// Mirrors the full screen surface of ReadPageLayout.
const ReadPageLoading = () => {
  return (
    <div className="absolute inset-0 h-screen w-screen" role="status" aria-live="polite">
      <div className="bg-reader-grey absolute h-full w-full" />
      <span className="sr-only">Læseren indlæses</span>
    </div>
  )
}

export default ReadPageLoading
