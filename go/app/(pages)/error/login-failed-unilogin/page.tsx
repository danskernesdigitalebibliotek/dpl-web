import { Metadata } from "next"
import React from "react"

import ErrorPageLayout from "@/components/pages/errorPageLayout/ErrorPageLayout"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

export const metadata: Metadata = setPageMetadata("Login fejlede")

const descriptionComponent = (
  <p>
    Tjek at dit brugernavn og kode er korrekte, eller prøv spørge din lærer om hjælp. Hvis du bliver
    ved at opleve fejl, må du meget gerne kontakte vores{" "}
    <a href="https://www.detdigitalefolkebibliotek.dk/ereolen-go-support">support</a>.
  </p>
)

const LoginNotAuthorized = () => (
  <ErrorPageLayout
    title="Login med UNI-login mislykkedes"
    description={descriptionComponent}
    buttonText="Gå til forsiden"
    buttonLink="/"
  />
)

export default LoginNotAuthorized
