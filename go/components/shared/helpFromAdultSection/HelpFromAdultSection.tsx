"use client"

import React, { useContext } from "react"

import ModalInfoSection from "@/components/shared/modalInfoSection/ModalInfoSection"
import { adultSiteUrl } from "@/lib/helpers/helper.adult-site"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

// The link must not promise online payment: some libraries only collect fees
// through payment slips sent to the guardians.
const HelpFromAdultSection = () => {
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const feesUrl = adultSiteUrl(dplCmsConfig?.libraryInfo?.baseURL, "/user/me/fees")

  return (
    <ModalInfoSection title="Hjælp fra en voksen">
      <p>
        Bare rolig - der er styr på det! Dine forældre/værge har allerede fået besked om, at de skal
        betale.
      </p>
      {feesUrl && (
        <p>
          I kan også læse mere her:{" "}
          <a href={feesUrl} target="_blank" rel="noopener noreferrer" className="focus-visible">
            Gebyrer & erstatninger
          </a>
        </p>
      )}
    </ModalInfoSection>
  )
}

export default HelpFromAdultSection
