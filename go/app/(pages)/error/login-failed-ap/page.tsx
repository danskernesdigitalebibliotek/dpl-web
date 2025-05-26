import { Metadata } from "next"
import React from "react"

import ErrorPageLayout from "@/components/pages/errorPageLayout/ErrorPageLayout"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

export const metadata: Metadata = setPageMetadata("Login fejlede")

const descriptionComponent = (
  <>
    <p>Vi kunne ikke logge dig ind med din biblioteksbruger.</p>
    <p>
      Prøv igen om lidt. Hvis du bliver ved at opleve fejl, må du meget gerne kontakte vores{" "}
      <a href="https://www.detdigitalefolkebibliotek.dk/ereolen-go-support">support</a>.
    </p>
  </>
)

const LoginNotAuthorized = () => (
  <ErrorPageLayout
    title="Fejl ved login med biblioteksbruger"
    description={descriptionComponent}
    buttonText="Gå til forsiden"
    buttonLink="/"
  />
)

export default LoginNotAuthorized
