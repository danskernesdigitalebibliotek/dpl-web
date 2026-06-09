"use server"

export const loadSession = async () => {
  const { getSessionDataProvider } = await import("@/lib/session/serverSideSession")

  const sessionData = await getSessionDataProvider()

  return sessionData.getObject()
}
