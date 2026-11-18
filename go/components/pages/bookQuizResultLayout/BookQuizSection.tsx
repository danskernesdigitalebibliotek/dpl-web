"use client"

import React from "react"

import SearchResults, {
  SearchResultsSkeleton,
} from "@/components/pages/searchPageLayout/SearchResults"
import { buttonVariants } from "@/components/shared/button/Button"
import { cyKeys } from "@/cypress/support/constants"
import { getStepQueryVariables } from "@/lib/book-quiz/ladder"
import type { TBookQuizOption, TBookQuizRange } from "@/lib/book-quiz/questions"
import { BOOKS_PER_STEP, rankStepWorks } from "@/lib/book-quiz/rank"
import { useComplexSearchForBookQuizQuery } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"

type TBookQuizSectionProps = {
  // The answers behind the step, one list per part. Shown as the title.
  answers: TBookQuizOption[][]
  // Null when the answers lack a part this step needs. The section is still
  // shown, with the empty message.
  cql: string | null
  ageRange?: TBookQuizRange
}

const BookQuizSection = ({ answers, cql, ageRange }: TBookQuizSectionProps) => {
  const { data, isLoading } = useComplexSearchForBookQuizQuery(getStepQueryVariables(cql ?? ""), {
    enabled: cql !== null,
  })
  const works = rankStepWorks(data?.complexSearch.works ?? [], ageRange)

  return (
    <section className="space-y-grid-gap-2" data-cy={cyKeys["book-quiz-section"]}>
      {/* The answers look like the quiz's answer buttons, but are not clickable. */}
      <h2 className="text-typo-heading-4 flex flex-wrap items-center gap-3">
        <span>Fordi du valgte</span>
        {answers.map((options, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span>+</span>}
            {options.length > 0 ? (
              options.map(option => (
                <span
                  key={option.id}
                  className={cn(buttonVariants({ variant: "option" }), "pointer-events-none")}>
                  {option.emoji && (
                    <span aria-hidden="true" className="text-[28px] leading-none">
                      {option.emoji}
                    </span>
                  )}
                  {option.label}
                </span>
              ))
            ) : (
              <span className="opacity-35">…</span>
            )}
          </React.Fragment>
        ))}
      </h2>
      <hr />
      {isLoading ? (
        <SearchResultsSkeleton count={BOOKS_PER_STEP} columns={BOOKS_PER_STEP} />
      ) : works.length > 0 ? (
        <SearchResults works={works} columns={BOOKS_PER_STEP} />
      ) : (
        <p className="text-typo-subtitle-lg opacity-35">Kombinationen gav ingen bøger</p>
      )}
    </section>
  )
}

export default BookQuizSection
