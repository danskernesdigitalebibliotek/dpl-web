import auth from "./auth"
import materialTypes from "./materialTypes"
import routes from "./routes"
import search from "./search"

export const resolvers = {
  ...auth,
  ...materialTypes,
  ...routes,
  ...search,
}

export type TResolvers = typeof resolvers
export type TConfigKey = keyof TResolvers
