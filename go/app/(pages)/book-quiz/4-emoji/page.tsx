import { Metadata } from "next"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

import EmojiDashboard from "./EmojiDashboard"

export const metadata: Metadata = setPageMetadata("Boganbefaler-quiz – PoC 4: Emoji")

const Page = () => {
  return <EmojiDashboard />
}

export default Page
