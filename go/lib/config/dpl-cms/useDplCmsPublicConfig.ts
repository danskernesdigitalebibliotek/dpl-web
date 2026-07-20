import { useEffect, useState } from "react"

import { TDplCmsPublicConfig } from "./configSchemas"
import { getDplCmsPublicConfig } from "./dplCmsConfig"

export default function useDplCmsPublicConfig() {
  const [config, setConfig] = useState<TDplCmsPublicConfig | null>(null)
  const [isLoading, setIsLoading] = useState<boolean | null>(null)
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getDplCmsPublicConfig()
        if (!data) {
          setIsError(true)
          return
        }
        setConfig(data)
      } catch {
        // A failed server call (or a non-Next environment like Storybook)
        // degrades to "no config" instead of an unhandled rejection.
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [setIsError, setIsLoading])

  return { config, isLoading, isError }
}
