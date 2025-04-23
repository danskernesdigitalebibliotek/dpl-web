import auth from "./auth"
import libraryToken from "./library-token"
import materialTypes from "./material-types"
import routes from "./routes"
import search from "./search"
import services from "./services"

export const resolvers = {
  ...auth,
  ...libraryToken,
  ...materialTypes,
  ...routes,
  ...search,
  ...services,
}

export type TResolvers = typeof resolvers
export type TConfigKey = keyof TResolvers
