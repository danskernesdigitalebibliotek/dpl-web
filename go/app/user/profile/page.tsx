import { Suspense } from "react"

import ProfilePageLayout, { ProfilePageLayoutSkeleton } from "@/app/user/profile/ProfilePageLayout"

const Page = () => {
  return (
    <Suspense fallback={<ProfilePageLayoutSkeleton />}>
      <ProfilePageLayout />
    </Suspense>
  )
}

export default Page
