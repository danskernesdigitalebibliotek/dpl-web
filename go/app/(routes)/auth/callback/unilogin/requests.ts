import { getEnv, getServerEnv } from "@/lib/config/env"
import { getUniloginWsCredentials } from "@/lib/helpers/unilogin"
import { createClientAsync } from "@/lib/soap/unilogin/wsiinst-v5/generated/ws"

import schemas from "./schemas"

// In test mode, use local WSDL with vendored XSDs to avoid remote fetches
const isTestMode = getEnv("TEST_MODE")
const clientEndpoint = isTestMode
  ? `${getServerEnv("UNILOGIN_WELLKNOWN_URL")}/institution`
  : undefined
const wsdlPath = isTestMode
  ? "./lib/soap/unilogin/wsiinst-v5/wsdl/test/ws.test.wsdl"
  : "./lib/soap/unilogin/wsiinst-v5/wsdl/ws.wsdl"

export const getInstitutionRequest = async (institutionId: string) => {
  const client = await createClientAsync(wsdlPath, {
    forceSoap12Headers: true,
    endpoint: clientEndpoint,
  })
  const { username, password } = await getUniloginWsCredentials()
  if (!username || !password) {
    throw new Error("Missing Unilogin credentials")
  }

  const [response] = await client.hentInstitutionAsync({
    wsBrugerid: username,
    wsPassword: password,
    instnr: institutionId,
  })

  return schemas.institution.parse(response.institution)
}
