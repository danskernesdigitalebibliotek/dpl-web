"use client"

import React from "react"

import { WorkCardSkeleton } from "@/components/shared/workCard/WorkCard"
import WorkTeaser from "@/components/shared/workTeaser/WorkTeaser"
import { getWorkTeaserProps } from "@/components/shared/workTeaser/helper"
import { FETCH_PER_STEP } from "@/lib/book-quiz/ladder"
import type { TBookQuizRange } from "@/lib/book-quiz/questions"
import { BOOKS_PER_STEP, rankStepWorks } from "@/lib/book-quiz/rank"
import { useComplexSearchForBookQuizQuery } from "@/lib/graphql/generated/fbi/graphql"

type TBookQuizSectionProps = {
  title: string
  // Null when the answers lack a part this step needs. The section is still
  // shown, with the empty message.
  cql: string | null
  ageRange?: TBookQuizRange
}

const BookQuizSection = ({ title, cql, ageRange }: TBookQuizSectionProps) => {
  const { data, isLoading } = useComplexSearchForBookQuizQuery(
    { cql: cql ?? "", limit: FETCH_PER_STEP },
    { enabled: cql !== null }
  )
  const works = rankStepWorks(data?.complexSearch.works ?? [], ageRange)

  return (
    <section className="space-y-grid-gap-2">
      <h2 className="text-typo-heading-4 lg:text-typo-heading-3">{title}</h2>
      <hr />
      {isLoading ? (
        <div className="grid-go gap-x-grid-gap-x">
          {Array.from({ length: BOOKS_PER_STEP }, (_, index) => (
            <div key={index} className="col-span-3 lg:col-span-4">
              <WorkCardSkeleton />
            </div>
          ))}
        </div>
      ) : works.length > 0 ? (
        <div className="grid-go gap-x-grid-gap-x gap-y-[calc(var(--grid-gap-x)*2)]">
          {works.map(work => (
            <div key={work.workId} className="col-span-3 lg:col-span-4">
              <WorkTeaser {...getWorkTeaserProps(work)} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-typo-subtitle-lg opacity-35">Kombinationen gav ingen bøger</p>
      )}
    </section>
  )
}

export default BookQuizSection
