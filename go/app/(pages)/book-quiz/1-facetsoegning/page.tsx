import { Metadata } from "next"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import FacetDashboard from "./FacetDashboard"

export const metadata: Metadata = setPageMetadata("Boganbefaler-quiz – PoC 1: Facetsøgning")

const Page = () => {
  return <FacetDashboard />
}

export default Page
