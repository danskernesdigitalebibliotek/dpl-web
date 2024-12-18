import { motion } from "framer-motion"
import React from "react"

import InfoBoxItem from "@/components/shared/infoBox/InfoBoxItem"
import { WorkFullWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"
import { useSelectedManifestationStore } from "@/store/selectedManifestation.store"

type InfoBoxDetailsProps = {
  work: WorkFullWorkPageFragment
}

const InfoBoxDetails = ({ work }: InfoBoxDetailsProps) => {
  const { selectedManifestation } = useSelectedManifestationStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}>
      <section className="mt-14 w-full rounded-md bg-background-overlay px-6 pb-14 pt-8 lg:flex-row lg:px-14">
        <h2 className="mb-10 text-typo-heading-4 lg:mb-24">Detaljer</h2>
        <div className="flex w-full flex-col gap-grid-gap-3 lg:flex-row lg:gap-44">
          <dl className="flex-1">
            {!!selectedManifestation && (
              <>
                <hr className="border-border not-first:mt-7" />
                <InfoBoxItem
                  term="Type"
                  description={selectedManifestation.materialTypes.map(
                    type => type.materialTypeGeneral.display
                  )}
                />
              </>
            )}
            {!!selectedManifestation?.languages?.main?.length && (
              <>
                <hr className="border-border not-first:mt-7" />
                <InfoBoxItem
                  term="Sprog"
                  description={selectedManifestation.languages.main.map(
                    language => language.display
                  )}
                />
              </>
            )}
            {!!selectedManifestation?.physicalDescription?.summaryFull && (
              <>
                <hr className="border-border not-first:mt-7" />
                <InfoBoxItem
                  term="Omfang"
                  description={[selectedManifestation.physicalDescription.summaryFull]}
                />
              </>
            )}
            {!!selectedManifestation?.dateFirstEdition?.display ||
              (work.workYear?.display && (
                <>
                  <hr className="border-border not-first:mt-7" />
                  <InfoBoxItem
                    term="Udgivelsesår"
                    description={[
                      selectedManifestation?.dateFirstEdition?.display || work.workYear?.display,
                    ]}
                  />
                </>
              ))}
          </dl>
          <dl className="flex-1">
            {!!selectedManifestation?.genreAndForm?.length && (
              <>
                <hr className="border-border not-first:mt-7" />
                <InfoBoxItem term="Genre" description={selectedManifestation.genreAndForm} />
              </>
            )}
            {!!selectedManifestation?.identifiers?.length &&
              !!getIsbnsFromManifestation(selectedManifestation)?.length && (
                <>
                  <hr className="border-border not-first:mt-7" />
                  <InfoBoxItem
                    term="ISBN"
                    description={getIsbnsFromManifestation(selectedManifestation)}
                  />
                </>
              )}
            {!!selectedManifestation?.publisher?.length && (
              <>
                <hr className="border-border not-first:mt-7" />
                <InfoBoxItem term="Forlag" description={selectedManifestation.publisher} />
              </>
            )}
            {(!!selectedManifestation?.contributors?.length ||
              !!selectedManifestation?.contributorsFromDescription?.length) && (
              <>
                <hr className="border-border not-first:mt-7" />
                <InfoBoxItem
                  term="Bidragsyder"
                  description={selectedManifestation?.contributors
                    .map(item => item.display)
                    .concat(selectedManifestation?.contributorsFromDescription)}
                />
              </>
            )}
          </dl>
        </div>
      </section>
    </motion.div>
  )
}

export default InfoBoxDetails
