import React from "react"

import ErrorPageLayout from "@/components/pages/errorPageLayout/ErrorPageLayout"

const LoginNotAuthorized = () => (
  <ErrorPageLayout
    title="Login fejlede"
    description="Af en eller anden grund gik det galt med at logge ind. Prøv igen eller kontakt support."
    buttonText="Gå til forsiden"
    buttonLink="/"
  />
)

export default LoginNotAuthorized
