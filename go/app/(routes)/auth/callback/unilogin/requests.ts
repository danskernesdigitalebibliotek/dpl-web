import { randomUUID } from "crypto"
import { WSSecurityCert } from "soap"

import { getEnv, getServerEnv } from "@/lib/config/env"
import { createClientAsync } from "@/lib/soap/unilogin/wsiinst-v6/generated/ws"

import schemas from "./schemas"

// In test mode, use local WSDL with vendored XSDs to avoid remote fetches
const isTestMode = getEnv("TEST_MODE")
const clientEndpoint = isTestMode
  ? `${getServerEnv("UNILOGIN_WELLKNOWN_URL")}/institution`
  : undefined
const wsdlPath = isTestMode
  ? "./lib/soap/unilogin/wsiinst-v6/wsdl/test/ws.test.wsdl"
  : "./lib/soap/unilogin/wsiinst-v6/wsdl/ws.wsdl"

const WSIINST_V6_NAMESPACE = "https://brugerdatabasen.stil.dk/bpi/wsiinst/6"
const COMMON_V3_NAMESPACE = "https://brugerdatabasen.stil.dk/bpi/common/3"

export const getInstitutionRequest = async (institutionId: string) => {
  const client = await createClientAsync(wsdlPath, {
    forceSoap12Headers: true,
    endpoint: clientEndpoint,
  })

  const privateKey = getServerEnv("UNILOGIN_WS_PRIVATE_KEY")
  const publicCert = getServerEnv("UNILOGIN_WS_PUBLIC_CERT")
  const udbydersystemId = getServerEnv("UNILOGIN_WS_UDBYDERSYSTEM_ID")

  if (!privateKey || !publicCert) {
    throw new Error("Missing Unilogin WS-Security certificate configuration")
  }

  if (!udbydersystemId) {
    throw new Error("Missing Unilogin UdbydersystemId (UNILOGIN_WS_UDBYDERSYSTEM_ID)")
  }

  // Configure WS-Security X.509 certificate signing
  const wsSecurity = new WSSecurityCert(privateKey, publicCert, undefined, {
    hasTimeStamp: true,
    signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
    additionalReferences: ["wsa:Action", "wsa:To", "wsa:MessageID"],
    signerOptions: {
      prefix: "ds",
      existingPrefixes: {
        wsse: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
      },
    },
  })
  client.setSecurity(wsSecurity)

  // Add UdbydersystemId SOAP header
  client.addSoapHeader(
    { UdbydersystemId: udbydersystemId },
    "",
    "uni",
    COMMON_V3_NAMESPACE
  )

  // Add WS-Addressing headers
  client.addSoapHeader({
    "wsa:Action": `${WSIINST_V6_NAMESPACE}/hentInstitution`,
    "wsa:To": clientEndpoint || `${WSIINST_V6_NAMESPACE}`,
    "wsa:MessageID": `urn:uuid:${randomUUID()}`,
  })

  const [response] = await client.hentInstitutionAsync({
    instnr: institutionId,
  })

  return schemas.institution.parse(response.institution)
}
