import { useInView } from "framer-motion"
import { useRef } from "react"

export const useParagraphDataLazyLoading = () => {
  const paragraphRef = useRef(null)
  const paragraphIsInView = useInView(paragraphRef, { once: true, margin: "1200px" })

  return {
    paragraphRef,
    paragraphIsInView,
  }
}
