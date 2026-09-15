import { Suspense } from "react"

import ReadPageLayout from "@/components/pages/readPageLayout/ReadPageLayout"
import ReadPageLoading from "@/components/pages/readPageLayout/ReadPageLoading"

function page() {
  return (
    <Suspense fallback={<ReadPageLoading />}>
      <ReadPageLayout />
    </Suspense>
  )
}

export default page
