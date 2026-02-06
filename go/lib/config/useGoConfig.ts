import { useEffect, useState } from "react"

import goConfig from "./goConfig"
import { TConfigKey, resolvers } from "./resolvers"

const createPromisesFromConfig = (keys: TConfigKey[]) => {
  // Get configuration resolvers.
  // Turn all configuration resolvers into promises.
  // So we can run them all together via Promise.all
  return keys.map(key => {
    return resolvers[key] instanceof Promise
      ? goConfig(key as TConfigKey)
      : Promise.resolve(goConfig(key as TConfigKey))
  })
}

// This functionality (useGoConfig) is used to retrieve configuration values from the client side.
const useGoConfig = <K extends TConfigKey>(keys: K[]) => {
  type GoConfigReturnType<K extends TConfigKey> = {
    [key in K]: ReturnType<typeof goConfig>
  }
  const [values, setValues] = useState<GoConfigReturnType<K> | null>(null)

  useEffect(() => {
    if (values) return
    const promises = createPromisesFromConfig(keys)

    async function retrieveData() {
      // Resolve all client configuration resolver promises
      // And create an object with the configuration values keyed by the requested keys.
      const confData = await Promise.all(promises)
      return confData.reduce(
        (acc: GoConfigReturnType<K>, value: ReturnType<typeof goConfig>, index: number) => {
          return { ...acc, [keys[index]]: value }
        },
        {} as GoConfigReturnType<K>
      )
    }

    retrieveData().then(data => {
      if (!data) return
      setValues(data)
    })
  }, [keys, values])

  return values
}

export default useGoConfig
