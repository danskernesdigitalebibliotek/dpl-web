import { getDplCmsPrivateConfig, getDplCmsPublicConfig } from "../config/dpl-cms/dplCmsConfig"

export const getUniloginWsCredentials = async () => {
  const {
    unilogin: { webServiceUsername: username, webServicePassword: password },
  } = await getDplCmsPrivateConfig()
  return {
    username,
    password,
  }
}

export const getLibraryMunicipalityId = async () => {
  const {
    unilogin: { municipalityId },
  } = await getDplCmsPublicConfig()
  return municipalityId
}

export const getInstitutionIds = (text: string) =>
  text.replace(/\[([^\]]*)\]/g, "$1").split(",") ?? []

export const getInstitutionId = (text: string) => {
  const ids = getInstitutionIds(text)
  return ids.length ? ids[0] : null
}
