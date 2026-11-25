"use client"

import { AnimatePresence } from "framer-motion"
import React, { useState } from "react"

import SearchResults, {
  SearchResultsSkeleton,
} from "@/components/pages/searchPageLayout/SearchResults"
import { Button, buttonVariants } from "@/components/shared/button/Button"
import { cyKeys } from "@/cypress/support/constants"
import type { TBookQuizOption } from "@/lib/book-quiz/questions"
import { BOOKS_PER_STEP } from "@/lib/book-quiz/rank"
import type { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"

import { getBatches } from "./helper"

type TBookQuizSectionProps = {
  // The answers behind the step. Shown as the title.
  answers: TBookQuizOption[]
  cql: string
  // All the books found for the step, best first.
  works: WorkTeaserSearchPageFragment[]
  isLoading: boolean
}

const BookQuizSection = ({ answers, cql, works, isLoading }: TBookQuizSectionProps) => {
  // The books are shown one batch at a time, in the same row. "Show more" swaps
  // in the next batch, and starts over after the last one. The batch belongs to
  // the search, so a retaken quiz on the same page starts with the first books
  // again.
  const batches = getBatches(works, BOOKS_PER_STEP)
  const [shown, setShown] = useState<{ cql: string; batch: number }>()
  const batch = shown?.cql === cql ? shown.batch : 0
  const canShowMore = batches.length > 1
  const showMore = () => setShown({ cql, batch: (batch + 1) % batches.length })

  // A search without books gives no section.
  if (!isLoading && works.length === 0) return null

  return (
    <section
      className="py-grid-gap-2 space-y-6 first:pt-0 last:pb-0 lg:space-y-8"
      data-cy={cyKeys["book-quiz-section"]}>
      {/* The answers look like the quiz's answer buttons, but are not clickable.
          On small screens they wrap below the title as smaller pills. */}
      <h2 className="text-typo-heading-4 flex flex-wrap items-center gap-2 lg:gap-3">
        <span className="w-full lg:w-auto">Fordi du valgte</span>
        {answers.map((option, index) => (
          // The plus stays with the answer after it, so a line never ends with
          // a plus.
          <span key={option.id} className="flex max-w-full items-center gap-2 lg:gap-3">
            {index > 0 && <span>+</span>}
            <span
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
          </span>
        ))}
      </h2>
      {isLoading ? (
        <SearchResultsSkeleton count={BOOKS_PER_STEP} columns={BOOKS_PER_STEP} />
      ) : (
        // Keyed by the batch, so the books leave before the next ones come in.
        <AnimatePresence mode="wait">
          <SearchResults
            key={`${cql}-${batch}`}
            works={batches[batch] ?? []}
            columns={BOOKS_PER_STEP}
            animated
          />
        </AnimatePresence>
      )}
      {/* After the books: first the suggestions, then the offer to see others. */}
      {canShowMore && (
        <div className="flex justify-center">
          <Button
            variant="icon-text"
            theme="secondary"
            icon="shuffle"
            className="bg-background"
            data-cy={cyKeys["book-quiz-more-button"]}
            onClick={showMore}>
            Vis flere bøger
          </Button>
        </div>
      )}
    </section>
  )
}

export default BookQuizSection
