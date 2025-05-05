import { Metadata } from "next"

import ProfilePageLayout from "@/app/user/profile/ProfilePageLayout"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

export const metadata: Metadata = setPageMetadata("Din profil")

const Page = () => {
  return (
    <>
      <ProfilePageLayout />
    </>
  )
}

export default Page

export const dynamic = "force-dynamic"
