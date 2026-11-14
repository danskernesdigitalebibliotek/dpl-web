import { Metadata } from "next"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import GruppeDashboard from "./GruppeDashboard"

export const metadata: Metadata = setPageMetadata("Boganbefaler-quiz – PoC 8: Genre- & emnegrupper")

const Page = () => {
  return <GruppeDashboard />
}

export default Page
