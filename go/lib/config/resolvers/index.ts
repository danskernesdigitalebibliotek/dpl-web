import app from "./app"
import search from "./search"
import serviceFbi from "./service.fbi"
import serviceUnilogin from "./service.unilogin"
import token from "./token"

export const resolvers = {
  ...app,
  ...serviceFbi,
  ...serviceUnilogin,
  ...search,
  ...token,
}

export type TResolvers = typeof resolvers
export type TConfigKey = keyof TResolvers
export type TConfigKeyClientOnly = Exclude<TConfigKey, `server-only.${string}`>

const createClientResolvers = <K extends TConfigKeyClientOnly>(resolvers: TResolvers) => {
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

export const clientResolvers = createClientResolvers(resolvers)

export type TClientResolvers = typeof clientResolvers
