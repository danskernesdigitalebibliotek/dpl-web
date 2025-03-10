export const getUniloginWsCredentials = () => {
  const username = process.env.UNLILOGIN_SERVICES_WS_USER ?? ""
  const password = process.env.UNLILOGIN_SERVICES_WS_PASSWORD ?? ""

  if (!username || !password) {
    throw new Error("Missing Unilogin WS credentials")
  }

  return {
    username,
    password,
  }
}

export const getLibraryMunicipalityId = () => {
  const municipalityId = process.env.UNILOGIN_MUNICIPALITY_ID ?? ""
  if (!municipalityId) {
    throw new Error("Missing Unilogin WS credentials")
  }
  return municipalityId
}
