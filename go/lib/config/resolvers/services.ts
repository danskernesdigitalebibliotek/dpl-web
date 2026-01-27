const services = {
  "services.ap-services": {
    fbi: {
      url: "https://fbi-api.dbc.dk/fbscms-go/graphql",
      useLibraryTokenAlways: false,
    },
    "pubhub-adapter": { url: "https://pubhub-openplatform.dbc.dk", useLibraryTokenAlways: false },
    fbs: { url: "https://fbs-openplatform.dbc.dk", useLibraryTokenAlways: false },
  },
}

export default services
