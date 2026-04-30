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

  const privateKey = getServerEnv("UNILOGIN_WS_PRIVATE_KEY")?.replace(/\\n/g, "\n")
  const publicCert = getServerEnv("UNILOGIN_WS_PUBLIC_CERT")?.replace(/\\n/g, "\n")
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
    additionalReferences: ["uni:UdbydersystemId", "wsa:Action", "wsa:To", "wsa:MessageID"],
    signerOptions: {
      prefix: "ds",
      existingPrefixes: {
        wsse: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
      },
    },
  })
  client.setSecurity(wsSecurity)

  // Add UdbydersystemId SOAP header (must be signed per policy)
  client.addSoapHeader(
    `<uni:UdbydersystemId xmlns:uni="${COMMON_V3_NAMESPACE}">${udbydersystemId}</uni:UdbydersystemId>`
  )

  // Add WS-Addressing headers as raw XML to ensure namespace declaration.
  const wsaNamespace = "http://www.w3.org/2005/08/addressing"
  const endpoint = clientEndpoint || WSIINST_V6_NAMESPACE
  client.addSoapHeader(
    `<wsa:Action xmlns:wsa="${wsaNamespace}">${WSIINST_V6_NAMESPACE}/hentInstitution</wsa:Action>` +
      `<wsa:To xmlns:wsa="${wsaNamespace}">${endpoint}</wsa:To>` +
      `<wsa:MessageID xmlns:wsa="${wsaNamespace}">urn:uuid:${randomUUID()}</wsa:MessageID>`
  )

  const [response] = await client.hentInstitutionAsync({
    instnr: institutionId,
  })

  return schemas.institution.parse(response.institution)
}
