import MissingConfigurationError from "./errors/MissingConfigurationError"
import { TConfigKey, TResolvers, resolvers } from "./resolvers"

export const retrieveValue = <
  TConfigResolver extends TResolvers,
  TConfigResolverKey extends keyof TConfigResolver,
>(
  key: TConfigResolverKey,
  resolvers: TConfigResolver
) => {
  if (key in resolvers) {
    if (typeof resolvers[key as TConfigResolverKey] !== "function") {
      return resolvers[key as TConfigResolverKey]
    }
    const resolver = resolvers[key as TConfigResolverKey]
    if (typeof resolver === "function") {
      return resolver()
    }
  }

  return null
}

const goConfig = <K extends TConfigKey>(key: K) => {
  const value = retrieveValue(key, resolvers)

  if (!value && value !== 0) {
    throw new MissingConfigurationError(`Missing configuration for ${key}`)
  }

  return value as TResolvers[K] extends () => infer R ? R : TResolvers[K]
}

export default goConfig
