import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import React from "react"

import InfoBoxItem from "@/components/shared/infoBox/InfoBoxItem"
import { getSeriesInfo } from "@/components/shared/infoBox/helper"
import { Manifestation, WorkFullWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

import { Button } from "../button/Button"

type InfoBoxProps = {
  work: WorkFullWorkPageFragment
  selectedManifestation: Manifestation
}

const InfoBox = ({ work, selectedManifestation }: InfoBoxProps) => {
  const subjects = selectedManifestation?.subjects.all.map(subject => subject.display) || []
  const router = useRouter()

  const handleClick = (text: string) => {
    const url = resolveUrl({ routeParams: { search: "search" }, queryParams: { q: text } })
    router.push(url, {
      scroll: true,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}>
      <section className="mt-14 w-full rounded-md bg-background-overlay px-6 pb-14 pt-8 lg:flex-row lg:px-14">
        <h2 className="mb-10 text-typo-heading-4 lg:mb-24">Beskrivelse</h2>
        <div className="flex w-full flex-col gap-grid-gap-3 lg:flex-row lg:gap-44">
          <div className="flex-1 text-typo-body-md">
            {!work.abstract?.length ? (
              <p>Værket har desværre ingen beskrivelse.</p>
            ) : (
              work.abstract.map(abstract => <p key={abstract.substring(0, 30)}>{abstract}</p>)
            )}
          </div>
          <dl className="flex-1">
            <InfoBoxItem term="Alder">
              {selectedManifestation?.audience?.ages.map(age => age.display).join(", ") || "-"}
            </InfoBoxItem>
            <InfoBoxItem term="Serie">
              {getSeriesInfo(selectedManifestation).join(", ") || "-"}
            </InfoBoxItem>
            <InfoBoxItem term="Emneord" classname="flex flex-row flex-wrap gap-2">
              {subjects
                ? subjects.map(subject => (
                    <Button
                      key={subject}
                      size={"sm"}
                      className="px-3"
                      onClick={() => handleClick(subject)}>
                      {subject}
                    </Button>
                  ))
                : "-"}
            </InfoBoxItem>
          </dl>
        </div>
      </section>
    </motion.div>
  )
}

export default InfoBox
