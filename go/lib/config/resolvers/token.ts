import { getEnv } from "../env"

const token = {
  // TODO: This is a temporary solution. We need to fetch the token via a graphql request.
  "token.adgangsplatformen.library": () => {
    if (getEnv("LIBRARY_TOKEN")) {
      return getEnv("LIBRARY_TOKEN")
    }
  },
}

export default token
