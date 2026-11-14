import { Metadata } from "next"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import ScoreDashboard from "./ScoreDashboard"

export const metadata: Metadata = setPageMetadata("Boganbefaler-quiz – PoC 5: Score")

const Page = () => {
  return <ScoreDashboard />
}

export default Page
