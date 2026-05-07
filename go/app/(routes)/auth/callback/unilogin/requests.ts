/**
 * Institutionsregisteret REST API — institution lookup via STIL's public REST service.
 *
 * Production: https://data.stil.dk/InstRegRestService/institution/{instNr}
 * Test:       https://test-data.stil.dk/InstRegRestService/institution/{instNr}
 *
 * Authentication uses Basic Auth (Uid + Pwd).
 * Credentials are obtained from Styrelsen for It og Laering.
 *
 * Required env vars (production):
 *   UNILOGIN_INST_REG_UID — REST API user ID
 *   UNILOGIN_INST_REG_PWD — REST API password
 *   UNILOGIN_INST_REG_URL — Base URL (optional, defaults to production)
 */
import { getEnv, getServerEnv } from "@/lib/config/env"

import schemas from "./schemas"

const INST_REG_PROD_URL = "https://data.stil.dk/InstRegRestService/institution"

export const getInstitutionRequest = async (institutionId: string) => {
  const isTestMode = getEnv("TEST_MODE")
  const baseUrl = isTestMode
    ? `${getServerEnv("UNILOGIN_WELLKNOWN_URL")}/institution`
    : (getServerEnv("UNILOGIN_INST_REG_URL") ?? INST_REG_PROD_URL)

  const url = `${baseUrl}/${institutionId}`

  const headers: HeadersInit = {
    Accept: "application/json",
  }

  if (!isTestMode) {
    const uid = getServerEnv("UNILOGIN_INST_REG_UID")
    const pwd = getServerEnv("UNILOGIN_INST_REG_PWD")

    if (!uid || !pwd) {
      throw new Error(
        "Missing Institutionsregisteret credentials (UNILOGIN_INST_REG_UID / UNILOGIN_INST_REG_PWD)"
      )
    }

    const basicAuth = Buffer.from(`${uid}:${pwd}`).toString("base64")
    headers["Authorization"] = `Basic ${basicAuth}`
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(
      `Institution lookup failed for ${institutionId}: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  return schemas.institution.parse(data)
}
