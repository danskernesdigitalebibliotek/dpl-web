import { Metadata } from "next"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import CorrelationDashboard from "./CorrelationDashboard"

export const metadata: Metadata = setPageMetadata("Boganbefaler-quiz – PoC 3: Korrelation")

const Page = () => {
  return <CorrelationDashboard />
}

export default Page
