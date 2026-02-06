import { getEnv, getServerEnv } from "@/lib/config/env"
import { getUniloginWsCredentials } from "@/lib/helpers/unilogin"
import { createClientAsync } from "@/lib/soap/unilogin/wsiinst-v5/generated/ws"

import schemas from "./schemas"

// Set client to mocked endpoint in test mode
const clientEndpoint = getEnv("TEST_MODE")
  ? `${getServerEnv("UNILOGIN_WELLKNOWN_URL")}/institution`
  : undefined

export const getInstitutionRequest = async (institutionId: string) => {
  const client = await createClientAsync("./lib/soap/unilogin/wsiinst-v5/wsdl/ws.wsdl", {
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
