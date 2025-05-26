import { Metadata } from "next"
import { connection } from "next/server"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import ProfilePageLayout from "./ProfilePageLayout"

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
