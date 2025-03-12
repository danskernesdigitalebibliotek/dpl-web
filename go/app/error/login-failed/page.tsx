import Link from "next/link"
import React from "react"

import ErrorPageLayout from "@/components/pages/errorPageLayout/ErrorPageLayout"

const LoginNotAuthorized = () => (
  <>
    <ErrorPageLayout
      lines={[
        "Login fejlede",
        "Af en eller anden grund gik det galt med at logge ind.",
        "Prøv igen eller kontakt support.",
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
