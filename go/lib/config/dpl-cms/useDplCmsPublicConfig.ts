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
      const data = await getDplCmsPublicConfig()
      if (!data) {
        setIsError(true)
        return
      }
      setIsLoading(false)
      setConfig(data)
    }
    fetchData()
  }, [setIsError, setIsLoading])

  return { config, isLoading, isError }
}
