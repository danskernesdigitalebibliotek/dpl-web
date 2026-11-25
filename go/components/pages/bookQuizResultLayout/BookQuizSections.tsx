"use client"

import { useQueries, useQueryClient } from "@tanstack/react-query"
import React from "react"

import {
  getShownBookQuizSteps,
  getStepQueryOptions,
} from "@/components/shared/bookQuizModal/helper"
import type { TLadderStep } from "@/lib/book-quiz/ladder"
import type { TBookQuizRange } from "@/lib/book-quiz/questions"
import { getStepWorkPool } from "@/lib/book-quiz/rank"

import BookQuizSection from "./BookQuizSection"

type TBookQuizSectionsProps = {
  steps: TLadderStep[]
  ageRanges: TBookQuizRange[]
}

// Searches for the books and shows one section per step, but no more than the
// page has room for. The shown steps are worked out again each time a search
// comes back, as a search with too few books lets the next step in. Coming from
// the quiz, the modal has already put the books in the query cache.
const BookQuizSections = ({ steps, ageRanges }: TBookQuizSectionsProps) => {
  const queryClient = useQueryClient()
  const shownSteps = getShownBookQuizSteps(queryClient, steps)
  const results = useQueries({
    queries: shownSteps.map(({ cql }) => getStepQueryOptions(cql)),
  })

  return (
    // A line between the sections, with the same space on both sides. Drawn
    // with CSS, as a section without books is not rendered.
    <div className="divide-foreground/10 divide-y">
      {shownSteps.map((step, index) => (
        <BookQuizSection
          key={step.id}
          answers={step.answers}
          cql={step.cql}
          works={getStepWorkPool(results[index]?.data?.complexSearch.works ?? [], ageRanges)}
          isLoading={results[index]?.isLoading ?? true}
        />
      ))}
    </div>
  )
}

export default BookQuizSections
