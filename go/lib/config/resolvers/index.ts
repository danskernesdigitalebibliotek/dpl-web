import app from "./app"
import materialTypes from "./materialTypes"
import search from "./search"
import serviceFbi from "./service.fbi"
import token from "./token"

export const resolvers = {
  ...app,
  ...serviceFbi,
  ...search,
  ...token,
  ...materialTypes,
}

export type TResolvers = typeof resolvers
export type TConfigKey = keyof TResolvers
