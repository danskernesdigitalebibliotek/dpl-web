"use client"

import { AnimatePresence } from "framer-motion"
import React, { useState } from "react"

import SearchResults, {
  SearchResultsSkeleton,
} from "@/components/pages/searchPageLayout/SearchResults"
import { Button, buttonVariants } from "@/components/shared/button/Button"
import { cyKeys } from "@/cypress/support/constants"
import { getStepQueryVariables } from "@/lib/book-quiz/ladder"
import type { TBookQuizOption, TBookQuizRange } from "@/lib/book-quiz/questions"
import { BOOKS_PER_STEP, getStepWorkPool, rankStepWorks } from "@/lib/book-quiz/rank"
import { useComplexSearchForBookQuizQuery } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"

import { shuffleWorks } from "./helper"

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
  const pool = getStepWorkPool(data?.complexSearch.works ?? [], ageRange)
  // The shuffled books belong to the search they were picked from, so a retaken
  // quiz on the same page shows its own top books again.
  const [shuffled, setShuffled] = useState<{ cql: string | null; works: typeof pool }>()
  const works =
    shuffled?.cql === cql
      ? shuffled.works
      : rankStepWorks(data?.complexSearch.works ?? [], ageRange)
  const canShuffle = pool.length > BOOKS_PER_STEP
  const shuffle = () => setShuffled({ cql, works: shuffleWorks(pool, works, BOOKS_PER_STEP) })

  return (
    <section className="space-y-6 lg:space-y-8" data-cy={cyKeys["book-quiz-section"]}>
      {/* The answers look like the quiz's answer buttons, but are not clickable.
          On small screens they wrap below the title as smaller pills. */}
      <h2 className="text-typo-heading-4 flex flex-wrap items-center gap-2 lg:gap-3">
        <span className="w-full lg:w-auto">Fordi du valgte</span>
        {answers.map((options, index) => {
          const [first, ...rest] =
            options.length > 0
              ? options.map(option => (
                  <span
                    key={option.id}
                    className={cn(
                      buttonVariants({ variant: "option" }),
                      "pointer-events-none min-h-10 gap-2 px-4 lg:min-h-[44px] lg:gap-3 lg:px-8"
                    )}>
                    {option.emoji && (
                      <span aria-hidden="true" className="text-[22px] leading-none lg:text-[28px]">
                        {option.emoji}
                      </span>
                    )}
                    {option.label}
                  </span>
                ))
              : [
                  <span key="none" className="opacity-35">
                    …
                  </span>,
                ]
          return (
            <React.Fragment key={index}>
              {/* The plus stays with the answer after it, so a line never
                    ends with a plus. */}
              <span className="flex max-w-full items-center gap-2 lg:gap-3">
                {index > 0 && <span>+</span>}
                {first}
              </span>
              {rest}
            </React.Fragment>
          )
        })}
      </h2>
      {isLoading ? (
        <SearchResultsSkeleton count={BOOKS_PER_STEP} columns={BOOKS_PER_STEP} />
      ) : works.length > 0 ? (
        // Keyed by the books, so a shuffle lets the old ones leave before the new
        // ones come in.
        <AnimatePresence mode="wait">
          <SearchResults
            key={works.map(work => work.workId).join("|")}
            works={works}
            columns={BOOKS_PER_STEP}
            animated
          />
        </AnimatePresence>
      ) : (
        <p className="text-typo-subtitle-lg opacity-35">Kombinationen gav ingen bøger</p>
      )}
      {/* After the books: first the suggestions, then the offer to see others. */}
      {canShuffle && (
        <div className="flex justify-center">
          <Button
            variant="icon-text"
            theme="secondary"
            icon="shuffle"
            className="bg-background"
            data-cy={cyKeys["book-quiz-shuffle-button"]}
            onClick={shuffle}>
            Bland bøgerne
          </Button>
        </div>
      )}
    </section>
  )
}

export default BookQuizSection
