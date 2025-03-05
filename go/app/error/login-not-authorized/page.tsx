import Link from "next/link"
import React from "react"

import ErrorPageLayout from "@/components/pages/errorPageLayout/ErrorPageLayout"

const LoginNotAuthorized = () => (
  <>
    <ErrorPageLayout
      lines={[
        "Ingen Unilogin adgang",
        "Din institution har ikke adgang til dette site.",
        "Hvis du mener at det er en fejl, så spørg din lærer eller en anden it-ansvarlig.",
        <>
          Gå til{" "}
          <Link href="/" className="animate-text-underline">
            forsiden
          </Link>
        </>,
      ]}
    />
  </>
)

export default LoginNotAuthorized
