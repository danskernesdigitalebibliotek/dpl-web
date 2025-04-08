import {
  getLibraryTokenCookieValue,
  loadLibraryToken,
  setLibraryTokenCookie,
} from "./library-token"

export const ensureLibraryTokenExist = async () => {
  const libraryTokenCookieValue = await getLibraryTokenCookieValue()
  if (!libraryTokenCookieValue) {
    const libraryToken = await loadLibraryToken()
    const timestamp = libraryToken?.expire.timestamp
    const expires = timestamp ? new Date(timestamp * 1000) : false
    if (libraryToken && expires) {
      setLibraryTokenCookie(libraryToken.token, expires)
    }
  }
}
