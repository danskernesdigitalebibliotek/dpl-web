import MissingConfigurationError from "./errors/MissingConfigurationError"
import app from "./resolvers/app"
import search from "./resolvers/search"
import serviceFbi from "./resolvers/service.fbi"
import serviceUnilogin from "./resolvers/service.unilogin"
import token from "./resolvers/token"

const resolvers = {
  ...app,
  ...serviceFbi,
  ...serviceUnilogin,
  ...search,
  ...token,
}

type TResolvers = typeof resolvers
type TConfigKey = keyof TResolvers

const retrieveValue = (key: TConfigKey): any => {
  if (key in resolvers) {
    if (typeof resolvers[key] !== "function") {
      return resolvers[key]
    }
    return resolvers[key]()
  }

  return null
}

const goConfig = <K extends TConfigKey>(
  key: K
): TResolvers[K] extends () => infer R ? R : TResolvers[K] => {
  const value = retrieveValue(key)

  if (!value && value !== 0) {
    throw new MissingConfigurationError(`Missing configuration for ${key}`)
  }

  return value
}

export default goConfig
