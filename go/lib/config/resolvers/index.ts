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
