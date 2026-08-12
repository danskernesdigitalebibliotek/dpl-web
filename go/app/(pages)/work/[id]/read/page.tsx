import { Suspense } from "react"

import ReadPageLayout from "@/components/pages/readPageLayout/ReadPageLayout"
import PageLoading from "@/components/shared/pageLoading/PageLoading"

function page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ReadPageLayout />
    </Suspense>
  )
}

export default page
