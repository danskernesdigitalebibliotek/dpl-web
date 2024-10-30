import MissingConfigurationError from "./errors/MissingConfigurationError"
import app from "./resolvers/app"
import serviceDplCms from "./resolvers/service.dpl-cms"
import serviceFbi from "./resolvers/service.fbi"
import serviceUnilogin from "./resolvers/service.unilogin"

const resolvers = {
  ...app,
  ...serviceDplCms,
  ...serviceFbi,
  ...serviceUnilogin,
}

const getConfig = (key: keyof typeof resolvers) => {
  let value
  if (key in resolvers) {
    value = resolvers[key]()
  }

  if (!value) {
    throw new MissingConfigurationError(`Missing configuration for ${key}`)
  }

  return value
}

export default getConfig
