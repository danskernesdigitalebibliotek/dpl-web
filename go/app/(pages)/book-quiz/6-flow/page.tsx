import { Metadata } from "next"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import QuizDashboard from "./QuizDashboard"

export const metadata: Metadata = setPageMetadata("Boganbefaler-quiz – PoC 6: Rigtigt flow")

const Page = () => {
  return <QuizDashboard />
}

export default Page
