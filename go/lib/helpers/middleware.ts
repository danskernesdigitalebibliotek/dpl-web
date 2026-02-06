import { NextRequest } from "next/server"

import goConfig from "../config/goConfig"
import { loadLibraryToken, setLibraryTokenCookie } from "./library-token"

export const ensureLibraryTokenExist = async (request: NextRequest) => {
  const libraryToken = request.cookies.get(goConfig("library-token.cookie-name"))?.value
  if (!libraryToken) {
    const libraryToken = await loadLibraryToken()
    const timestamp = libraryToken?.expire.timestamp
    const expires = timestamp ? new Date(timestamp * 1000) : false
    if (libraryToken && expires) {
      setLibraryTokenCookie(libraryToken.token, expires)
    }
  }
}
