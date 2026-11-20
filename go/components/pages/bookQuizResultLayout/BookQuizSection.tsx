"use client"

import { AnimatePresence } from "framer-motion"
import React, { useState } from "react"

import SearchResults, {
  SearchResultsSkeleton,
} from "@/components/pages/searchPageLayout/SearchResults"
import { Button, buttonVariants } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
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

  return (
    <section className="space-y-6 lg:space-y-8" data-cy={cyKeys["book-quiz-section"]}>
      <div className="flex flex-wrap items-center justify-between gap-4">
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
        {canShuffle && (
          <Button
            variant="icon"
            theme="secondary"
            ariaLabel="Bland bøgerne"
            className="bg-background"
            data-cy={cyKeys["book-quiz-shuffle-button"]}
            onClick={() => setShuffled({ cql, works: shuffleWorks(pool, works, BOOKS_PER_STEP) })}>
            <Icon className="h-[24px] w-[24px]" name="shuffle" />
          </Button>
        )}
      </div>
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
    </section>
  )
}

export default BookQuizSection
