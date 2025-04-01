import React from "react"

import ErrorPageLayout from "@/components/pages/errorPageLayout/ErrorPageLayout"

const LoginNotAuthorized = () => (
  <ErrorPageLayout
    title="Ingen Unilogin adgang"
    description="Din institution har ikke adgang til dette site. Hvis du mener at det er en fejl, så spørg din lærer eller en anden it-ansvarlig."
    buttonText="Gå til forsiden"
    buttonLink="/"
  />
)

export default LoginNotAuthorized
