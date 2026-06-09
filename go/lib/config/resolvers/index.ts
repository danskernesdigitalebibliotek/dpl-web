import caching from "./caching"
import materialTypes from "./materialTypes"
import routes from "./routes"
import search from "./search"
import services from "./services"

export const resolvers = {
  ...caching,
  ...materialTypes,
  ...routes,
  ...search,
  ...services,
}

export type TResolvers = typeof resolvers
export type TConfigKey = keyof TResolvers
