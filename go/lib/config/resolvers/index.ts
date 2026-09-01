import auth from "./auth"
import caching from "./caching"
import libraryToken from "./library-token"
import loans from "./loans"
import materialTypes from "./materialTypes"
import routes from "./routes"
import search from "./search"
import services from "./services"

export const resolvers = {
  ...auth,
  ...caching,
  ...libraryToken,
  ...loans,
  ...materialTypes,
  ...routes,
  ...search,
  ...services,
}

export type TResolvers = typeof resolvers
export type TConfigKey = keyof TResolvers
