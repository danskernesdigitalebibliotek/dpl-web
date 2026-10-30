import { Metadata } from "next"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import ScoreModelDashboard from "./ScoreModelDashboard"

export const metadata: Metadata = setPageMetadata("Boganbefaler-quiz – PoC 7: Score-model (A/B)")

const Page = () => {
  return <ScoreModelDashboard />
}

export default Page
