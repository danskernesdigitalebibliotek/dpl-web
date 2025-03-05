import { getUniloginWsCredentials } from "@/lib/helpers/unilogin"
import { createClientAsync } from "@/lib/soap/unilogin/wsiinst-v5/generated/ws"

import schemas from "./schemas"

export const getInstitution = async (institutionId: string) => {
  const client = await createClientAsync("./lib/soap/unilogin/wsiinst-v5/wsdl/ws.wsdl", {
    forceSoap12Headers: true,
  })
  const { username, password } = getUniloginWsCredentials()
  const [response] = await client.hentInstitutionAsync({
    wsBrugerid: username,
    wsPassword: password,
    instnr: institutionId,
  })

  return schemas.institution.parse(response.institution)
}
