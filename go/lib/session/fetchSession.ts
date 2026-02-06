import { getEnv } from "../config/env"
import goConfig from "../config/goConfig"
import { TSessionData } from "./session"

export const loadSession = async () => {
  // By using an absolute url we make sure that we can fetch the session both client and server side.
  const response = await fetch(`${getEnv("APP_URL")}/${goConfig("routes.session")}`)
  if (!response.ok) {
    throw new Error("Failed to fetch session")
  }

  return (await response.json()) as TSessionData
}
