import MissingConfigurationError from "./errors/MissingConfigurationError"
import resolvers, { TConfigKey, TResolvers } from "./resolvers"

export const retrieveValue = (key: TConfigKey): unknown => {
  if (key in resolvers) {
    if (typeof resolvers[key] !== "function") {
      return resolvers[key]
    }
    return resolvers[key]()
  }

  return null
}

const goConfig = <K extends TConfigKey>(key: K) => {
  const value = retrieveValue(key)

  if (!value && value !== 0) {
    throw new MissingConfigurationError(`Missing configuration for ${key}`)
  }

  return value as TResolvers[K] extends () => infer R ? R : TResolvers[K]
}

export default goConfig
