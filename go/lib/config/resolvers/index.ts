import app from "./app"
import auth from "./auth"
import materialTypes from "./materialTypes"
import routes from "./routes"
import search from "./search"
import serviceFbi from "./service.fbi"
import token from "./token"

export const resolvers = {
  ...app,
  ...auth,
  ...materialTypes,
  ...routes,
  ...search,
  ...serviceFbi,
  ...token,
}

export type TResolvers = typeof resolvers
export type TConfigKey = keyof TResolvers
