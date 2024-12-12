import { motion } from "framer-motion"
import React from "react"

import { WorkFullWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { useSelectedManifestationStore } from "@/store/selectedManifestation.store"

import InfoBoxItem from "./InfoBoxItem"
import { getSeriesInfo } from "./helper"

type InfoBoxProps = {
  work: WorkFullWorkPageFragment
}

const InfoBox = ({ work }: InfoBoxProps) => {
  const { selectedManifestation } = useSelectedManifestationStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}>
      <section className="relative flex w-full rounded-md bg-background-overlay lg:mt-16 lg:gap-48 lg:px-14 lg:pb-14 lg:pt-36">
        <div className="flex-1 text-typo-body-md">
          <h2 className="top-9 text-typo-heading-4 lg:absolute lg:left-14">Beskrivelse</h2>
          {!work.abstract ||
            (!work.abstract.length && <p>Værket har desværre ingen beskrivelse.</p>)}
          {work.abstract &&
            work.abstract.length &&
            work.abstract.map(abstract => <p key={abstract.substring(0, 30)}>{abstract}</p>)}
        </div>
        <dl className="flex-1">
          {!!selectedManifestation?.audience && (
            <InfoBoxItem
              term="Alder"
              description={selectedManifestation?.audience?.ages.map(age => age.display)}
            />
          )}
          {!!selectedManifestation && (
            <InfoBoxItem term="Serie" description={getSeriesInfo(selectedManifestation)} />
          )}
          {!!selectedManifestation?.subjects.all &&
            selectedManifestation?.subjects.all.length > 0 && (
              <InfoBoxItem
                term="Emneord"
                description={selectedManifestation.subjects.all.map(subject => subject.display)}
                isButtons
              />
            )}
        </dl>
      </section>
    </motion.div>
  )
}

export default InfoBox
