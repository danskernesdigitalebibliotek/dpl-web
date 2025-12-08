import { headers } from "next/headers"
import Script from "next/script"

export async function CookieInformation() {
  const headersList = await headers()
  const host = headersList.get("host") || ""

  // Temporarily only render on go.delingstjenesten.dk
  if (host !== "go.delingstjenesten.dk") {
    return null
  }

  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      id="CookieConsent"
      src="https://policy.app.cookieinformation.com/uc.js"
      data-culture="DA"
      data-gcm-version="2.0"
      strategy="beforeInteractive"
    />
  )
}
