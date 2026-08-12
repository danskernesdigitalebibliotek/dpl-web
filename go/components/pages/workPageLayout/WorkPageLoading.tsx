import React from "react"

import { WorkPageSkeleton } from "@/components/pages/workPageLayout/WorkPageLayout"

// Mirrors the container of WorkPageLayout so the skeleton and the loaded page
// occupy the same space.
const WorkPageLoading = () => {
  return (
    <div
      className="content-container my-grid-gap-2 lg:my-grid-gap-half flex-row flex-wrap"
      role="status"
      aria-live="polite">
      <span className="sr-only">Materialet indlæses</span>
      <WorkPageSkeleton />
    </div>
  )
}

export default WorkPageLoading
