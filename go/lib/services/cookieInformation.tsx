import Script from "next/script"

export function CookieInformation() {
  return (
    <Script
      id="CookieConsent"
      src="https://policy.app.cookieinformation.com/uc.js"
      data-culture="DA"
      data-gcm-version="2.0"
      strategy="beforeInteractive"
    />
  )
}
