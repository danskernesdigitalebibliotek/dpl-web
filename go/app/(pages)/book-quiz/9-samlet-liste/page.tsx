import { Metadata } from "next"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import SamletDashboard from "./SamletDashboard"

export const metadata: Metadata = setPageMetadata("Boganbefaler-quiz – PoC 9: Én samlet liste")

const Page = () => {
  return <SamletDashboard />
}

export default Page
