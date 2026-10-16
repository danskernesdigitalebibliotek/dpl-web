import { Metadata } from "next"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import TilladtListeDashboard from "./TilladtListeDashboard"

export const metadata: Metadata = setPageMetadata("Boganbefaler-quiz – PoC 2: Tilladt-liste")

const Page = () => {
  return <TilladtListeDashboard />
}

export default Page
