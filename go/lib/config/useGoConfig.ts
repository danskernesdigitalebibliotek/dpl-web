import { useEffect, useState } from "react"

import goConfig from "./goConfig"
import resolvers, { TConfigKey, TResolvers } from "./resolvers"

// This functionality (useGoConfig) is used to retrieve configuration values from the client side.
// Only non sensitive configuration values should retrieved from the client side.

type TConfigKeyClientOnly = Exclude<TConfigKey, `server-only.${string}`>

const clientResolvers = <K extends TConfigKeyClientOnly>(resolvers: TResolvers) => {
  // Filter out server-only configuration resolvers
  return Object.keys(resolvers).reduce(
    (acc, key) => {
      if (!key.startsWith("server-only.")) {
        return { ...acc, [key]: resolvers[key as K] }
      }
      return acc
    },
    {} as Omit<TResolvers, `server-only.${string}`>
  )
}

const createPromisesFromConfig = (keys: TConfigKeyClientOnly[]) => {
  // Get only client side configuration resolvers.
  const filteredResolvers = clientResolvers(resolvers)
  // Turn all configuration resolvers into promises.
  // So we can run them all together via Promise.all
  return keys.map(key => {
    return filteredResolvers[key] instanceof Promise
      ? goConfig(key as TConfigKeyClientOnly)
      : Promise.resolve(goConfig(key as TConfigKeyClientOnly))
  })
}

const useGoConfig = <K extends TConfigKeyClientOnly>(keys: K[]) => {
  type GoConfigReturnType<K extends TConfigKeyClientOnly> = {
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
