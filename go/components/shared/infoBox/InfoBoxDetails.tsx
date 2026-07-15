import { motion } from "framer-motion"
import React from "react"

import { translateMaterialTypesStringForRender } from "@/components/pages/workPageLayout/helper"
import InfoBoxItem from "@/components/shared/infoBox/InfoBoxItem"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"

type InfoBoxDetailsProps = {
  selectedManifestation: ManifestationWorkPageFragment
}

const InfoBoxDetails = ({ selectedManifestation }: InfoBoxDetailsProps) => {
  // get selectedManifestation materialTypes and translate them for render
  const materialTypeDisplays = selectedManifestation.materialTypes.map(materialType => {
    return translateMaterialTypesStringForRender(materialType.materialTypeSpecific.code)
  })

  return (
    <motion.section
      className="bg-background-overlay rounded-base p-grid-edge w-full md:p-8 lg:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}>
      <h2 className="text-typo-heading-4 mb-8">Detaljer</h2>
      <div className="gap-grid-gap flex w-full flex-col lg:flex-row">
        <dl className="flex-1">
          <InfoBoxItem term="Type">{materialTypeDisplays.join(", ") || "-"}</InfoBoxItem>
          <InfoBoxItem term="Sprog">
            {selectedManifestation?.languages?.main?.map(language => language.display).join(", ") ||
              "-"}
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
    </motion.section>
  )
}

export default InfoBoxDetails
