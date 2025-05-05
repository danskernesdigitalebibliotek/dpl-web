import { Metadata } from "next"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import ProfilePageLayout from "./ProfilePageLayout"

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
