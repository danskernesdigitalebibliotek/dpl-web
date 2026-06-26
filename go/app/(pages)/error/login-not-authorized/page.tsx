import { Metadata } from "next"
import React from "react"

import ErrorPageLayout from "@/components/pages/errorPageLayout/ErrorPageLayout"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

export const metadata: Metadata = setPageMetadata("Ingen adgang med Unilogin")

const descriptionComponent = (
  <>
    <p>
      Din skole er ikke tilmeldt GO med Unilogin. Brug almindeligt bibliotekslogin i stedet. Hvis du
      ikke har et, kan du få et på dit lokale bibliotek med en forælder/værge. Det koster ikke noget
      at få et bibliotekslogin.
    </p>
    <h4>
      Er du medarbejder på en skole, der ønsker en aftale om login med Unilogin på eReolen GO?
    </h4>
    <p>
      For at elever og medarbejdere på din skole kan få adgang til at logge ind med Unilogin på GO,
      skal I kontakte jeres kommunes bibliotek for at få nærmere informationer om muligheden.
    </p>
    <p>
      Er du i tvivl, om I allerede er tilmeldt GO med Unilogin, eller har du andre generelle
      spørgsmål vedr. GO og deltagelse med Unilogin, kan vi kontaktes på{" "}
      <a href="mailto:unilogin@ereolengo.dk">unilogin@ereolengo.dk</a>.
    </p>
  </>
)

const LoginNotAuthorized = () => (
  <ErrorPageLayout
    title="Ingen adgang med Unilogin"
    description={descriptionComponent}
    buttonText="Gå til forsiden"
    buttonLink="/"
  />
)

export default LoginNotAuthorized
