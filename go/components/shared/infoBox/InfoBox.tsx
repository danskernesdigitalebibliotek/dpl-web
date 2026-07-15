"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import React from "react"

import InfoBoxItem from "@/components/shared/infoBox/InfoBoxItem"
import {
  ManifestationWorkPageFragment,
  WorkFullWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

import { Button } from "../button/Button"

type InfoBoxProps = {
  work: WorkFullWorkPageFragment
  selectedManifestation: ManifestationWorkPageFragment
}

const InfoBox = ({ work, selectedManifestation }: InfoBoxProps) => {
  const ageString = selectedManifestation?.audience?.ages.map(age => age.display).join(", ") || "-"
  const subjects = selectedManifestation?.subjects.all.map(subject => subject.display) || []
  // Remove duplicates
  const uniqueSubjects = [...new Set(subjects)]

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-background-overlay rounded-base p-grid-edge w-full md:p-8 lg:flex-row">
      <h2 className="text-typo-heading-4 mb-8">Beskrivelse</h2>
      <div className="gap-grid-edge flex w-full flex-col md:gap-8 lg:flex-row">
        <div className="flex-1">
          <div className="wysiwyg max-w-prose">
            {!work.abstract?.length ? (
              <p>Værket har desværre ingen beskrivelse.</p>
            ) : (
              work.abstract.map((abstract, index) => <p key={index}>{abstract}</p>)
            )}
          </div>
        </div>
        <dl className="flex-1">
          <InfoBoxItem term="Alder">{ageString}</InfoBoxItem>
          <InfoBoxItem term="Serie">
            {selectedManifestation.series.length
              ? selectedManifestation.series.map((series, index) => {
                  if (!series.title) {
                    return <span key={index}>{"-"}</span>
                  }

                  return (
                    <div key={index}>
                      {series.numberInSeries && <span>{`${series.numberInSeries} i`} </span>}
                      <Link
                        className="animate-text-underline"
                        href={resolveUrl({
                          routeParams: { search: "search" },
                          queryParams: { q: series.title },
                        })}>
                        {series.title}
                      </Link>
                    </div>
                  )
                })
              : "-"}
          </InfoBoxItem>
          <InfoBoxItem term="Emneord" classname="flex flex-row flex-wrap gap-2">
            {uniqueSubjects.length
              ? uniqueSubjects.map((subject, index) => (
                  <Button key={index} asChild size={"sm"} className="px-3">
                    <Link
                      href={resolveUrl({
                        routeParams: { search: "search" },
                        queryParams: { q: subject },
                      })}>
                      {subject}
                    </Link>
                  </Button>
                ))
              : "-"}
          </InfoBoxItem>
        </dl>
      </div>
    </motion.section>
  )
}

export default InfoBox
