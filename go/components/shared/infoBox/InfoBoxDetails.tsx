import { motion } from "framer-motion"
import React from "react"

import { translateMaterialTypesStringForRender } from "@/components/pages/workPageLayout/helper"
import InfoBoxItem from "@/components/shared/infoBox/InfoBoxItem"
import {
  GeneralMaterialTypeCodeEnum,
  ManifestationWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"

type InfoBoxDetailsProps = {
  selectedManifestation: ManifestationWorkPageFragment
}

const InfoBoxDetails = ({ selectedManifestation }: InfoBoxDetailsProps) => {
  // get selectedManifestation materialTypes and translate them for render
  const materialTypeDisplays = selectedManifestation.materialTypes.map(materialType => {
    return translateMaterialTypesStringForRender(
      materialType.materialTypeGeneral.code as GeneralMaterialTypeCodeEnum
    )
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}>
      <section
        className="bg-background-overlay mt-14 w-full rounded-md px-6 pt-8 pb-14 lg:flex-row
          lg:px-14">
        <h2 className="text-typo-heading-4 mb-10 lg:mb-24">Detaljer</h2>
        <div className="gap-grid-gap-3 flex w-full flex-col lg:flex-row lg:gap-44">
          <dl className="flex-1">
            <InfoBoxItem term="Type">{materialTypeDisplays.join(", ") || "-"}</InfoBoxItem>
            <InfoBoxItem term="Sprog">
              {selectedManifestation?.languages?.main
                ?.map(language => language.display)
                .join(", ") || "-"}
            </InfoBoxItem>
            <InfoBoxItem term="Længde">
              {selectedManifestation?.physicalDescription?.summaryFull || "-"}
            </InfoBoxItem>
            <InfoBoxItem term="Udgivelsesår">
              {selectedManifestation?.dateFirstEdition?.display || "-"}
            </InfoBoxItem>
          </dl>
          <dl className="flex-1">
            <InfoBoxItem term="Genre">
              {selectedManifestation?.genreAndForm.map(genre => genre).join(", ") || "-"}
            </InfoBoxItem>
            <InfoBoxItem term="ISBN">
              {getIsbnsFromManifestation(selectedManifestation).join(", ") || "-"}
            </InfoBoxItem>
            <InfoBoxItem term="Forlag">
              {selectedManifestation?.publisher.map(publisher => publisher).join(", ") || "-"}
            </InfoBoxItem>
            <InfoBoxItem term="Bidragsyder">
              {selectedManifestation?.contributors
                .map(item => item.display)
                .concat(selectedManifestation?.contributorsFromDescription)
                .join(", ") || "-"}
            </InfoBoxItem>
          </dl>
        </div>
      </section>
    </motion.div>
  )
}

export default InfoBoxDetails
