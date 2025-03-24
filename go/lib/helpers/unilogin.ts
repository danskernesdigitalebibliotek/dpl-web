import { getServerEnv } from "../config/env"

export const getUniloginWsCredentials = () => {
  const username = getServerEnv("UNLILOGIN_SERVICES_WS_USER")
  const password = getServerEnv("UNLILOGIN_SERVICES_WS_PASSWORD")

  return {
    username,
    password,
  }
}

export const getLibraryMunicipalityId = () => getServerEnv("UNILOGIN_MUNICIPALITY_ID")
