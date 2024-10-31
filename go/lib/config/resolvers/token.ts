const token = {
  // TODO: This is a temporary solution. We need to fetch the token via a graphql request.
  "token.adgangsplatformen.library": () => {
    if (process.env.NEXT_PUBLIC_LIBRARY_TOKEN) {
      return process.env.NEXT_PUBLIC_LIBRARY_TOKEN
    }
  },
}

export default token
