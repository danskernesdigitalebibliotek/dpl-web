import { Metadata } from "next"
import { connection } from "next/server"

import ProfilePageLayout from "@/components/pages/profilePageLayout/ProfilePageLayout"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

export const metadata: Metadata = setPageMetadata("Din profil")

const Page = async () => {
  await connection()

  return (
    <>
      <ProfilePageLayout />
    </>
  )
}

export default Page
