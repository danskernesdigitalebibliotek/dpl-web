"use client"

import React from "react"

import ModalInfoSection from "@/components/shared/modalInfoSection/ModalInfoSection"
import useDplCmsPublicConfig from "@/lib/config/dpl-cms/useDplCmsPublicConfig"

// The reassurance box shared by the fee and compensation modals: guardians
// have been notified, and payment happens on the library site — GO doesn't
// handle payment itself.
const HelpFromAdultSection = () => {
  // Payment happens on the library's own (adult) site; its base URL only
  // exists client-side through the public CMS config.
  const { config } = useDplCmsPublicConfig()
  const cmsBaseUrl = config?.libraryInfo?.baseURL
  const paymentUrl = cmsBaseUrl ? `${cmsBaseUrl}/user/me/fees` : null

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
