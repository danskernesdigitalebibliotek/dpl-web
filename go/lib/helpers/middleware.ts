import { loadLibraryToken } from "@/lib/helpers/library-token"
import { getSessionDataProvider } from "@/lib/session/serverSideSession"

export const ensureLibraryTokenExist = async () => {
  const sessionData = await getSessionDataProvider()
  const libraryToken = sessionData.getLibraryToken()

  if (!libraryToken) {
    const libraryToken = await loadLibraryToken()
    const timestamp = libraryToken?.expire.timestamp

    if (libraryToken && timestamp) {
      await sessionData.setValue("adgangsplatformenLibraryToken", libraryToken)
      void sessionData.setExpiresAt(timestamp)
    }
  }
}
