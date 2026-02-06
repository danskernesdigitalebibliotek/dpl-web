import { Suspense } from "react"

import ReadPageLayout from "@/components/pages/readPageLayout/ReadPageLayout"

function page() {
  return (
    <Suspense>
      <ReadPageLayout />
    </Suspense>
  )
}

export default page
