const services = {
  "services.ap-services": {
    covers: { url: "https://cover.dandigbib.org", useLibraryTokenAlways: true },
    fbi: {
      url: "https://fbi-api.dbc.dk/{search_profile_placeholder}/graphql",
      useLibraryTokenAlways: false,
    },
    "pubhub-adapter": { url: "https://pubhub-openplatform.dbc.dk", useLibraryTokenAlways: false },
    fbs: { url: "https://fbs-openplatform.dbc.dk", useLibraryTokenAlways: false },
  },
}

export default services
