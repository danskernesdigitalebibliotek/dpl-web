import MissingConfigurationError from "./errors/MissingConfigurationError"
import app from "./resolvers/app"
import search from "./resolvers/search"
import serviceDplCms from "./resolvers/service.dpl-cms"
import serviceFbi from "./resolvers/service.fbi"
import serviceUnilogin from "./resolvers/service.unilogin"
import token from "./resolvers/token"

const resolvers = {
  ...app,
  ...serviceDplCms,
  ...serviceFbi,
  ...serviceUnilogin,
  ...search,
  ...token,
}

const retrieveValue = (key: keyof typeof resolvers) => {
  if (key in resolvers) {
    if (typeof resolvers[key] !== "function") {
      return resolvers[key]
    }
    return resolvers[key]()
  }

  return null
}

const getConfig = <TValue>(key: keyof typeof resolvers) => {
  const value = retrieveValue(key) as TValue

  if (!value && value !== 0) {
    throw new MissingConfigurationError(`Missing configuration for ${key}`)
  }

  return value
}

export default getConfig
