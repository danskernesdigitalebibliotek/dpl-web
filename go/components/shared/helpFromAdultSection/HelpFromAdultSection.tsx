"use client"

import React, { useContext } from "react"

import ModalInfoSection from "@/components/shared/modalInfoSection/ModalInfoSection"
import { adultSiteUrl } from "@/lib/helpers/helper.adult-site"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

// The reassurance box shared by the fee and compensation modals: guardians
// have been notified, and payment happens on the library site — GO doesn't
// handle payment itself.
const HelpFromAdultSection = () => {
  // Payment happens on the library's own (adult) site.
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const paymentUrl = adultSiteUrl(dplCmsConfig?.libraryInfo?.baseURL, "/user/me/fees")

  return (
    <ModalInfoSection title="Hjælp fra en voksen">
      <p>
        Bare rolig - der er styr på det! Dine forældre/værge har allerede fået besked om, at de skal
        betale.
      </p>
      {paymentUrl && (
        <p>
          I kan også betale via linket her:{" "}
          <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="focus-visible">
            Betalingssiden
          </a>
        </p>
      )}
    </ModalInfoSection>
  )
}

export default HelpFromAdultSection
