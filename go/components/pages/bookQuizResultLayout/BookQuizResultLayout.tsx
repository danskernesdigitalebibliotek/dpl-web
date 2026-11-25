import React from "react"

import BookQuizBurst from "@/components/shared/bookQuizModal/BookQuizBurst"
import BookQuizWatermark from "@/components/shared/bookQuizModal/BookQuizWatermark"
import {
  QUIZ_COLOR_CLASSES,
  QUIZ_EMPTY_COLOR_CLASSES,
} from "@/components/shared/bookQuizModal/colors"
import type { TLadderStep } from "@/lib/book-quiz/ladder"
import { type TBookQuizProfile, getBookQuizColor } from "@/lib/book-quiz/profile"
import { cn } from "@/lib/helpers/helper.cn"

import BookQuizSection from "./BookQuizSection"
import OpenBookQuizButton from "./OpenBookQuizButton"
import { getHeroEmojis, getHeroTexts } from "./helper"

type TBookQuizResultLayoutProps = {
  profile: TBookQuizProfile
  steps: TLadderStep[]
}

const BookQuizResultLayout = ({ profile, steps }: TBookQuizResultLayoutProps) => {
  // Without genre, mood or subjects there is nothing to search for, e.g. when
  // the page is opened from an old or broken link. The hero is still shown,
  // and asks the user to take the quiz.
  const hasResults = steps.length > 0
  const texts = getHeroTexts(profile, hasResults)
  const color = getBookQuizColor(profile)

  return (
    <div className="content-container space-y-grid-gap-3">
      {/* The quiz's colour and watermark, with the girl from the quiz and the
          user's answers bursting out of her book. */}
      <div
        className={cn(
          hasResults ? QUIZ_COLOR_CLASSES[color] : QUIZ_EMPTY_COLOR_CLASSES,
          `dark:bg-background-overlay-solid relative isolate grid items-center overflow-hidden
          rounded-xl bg-(--quiz-bg) px-6 pt-8 lg:grid-cols-2 lg:gap-6 lg:px-10 lg:pt-0`
        )}>
        {/* Behind the girl: below the text on small screens, to the right from lg. */}
        <BookQuizWatermark
          className="-right-[25%] -bottom-[22%] w-[125%] lg:-right-[10%] lg:-bottom-[60%]
            lg:w-[60%]"
        />
        {/* Grouped by distance: the lead-in sits close to the heading it
            belongs to, the text a little further away, the button furthest.
            Centred above the girl on small screens, beside her from lg. */}
        <div className="text-center lg:py-10 lg:text-left">
          {texts.leadIn && (
            <p className="text-typo-subtitle-md lg:text-typo-subtitle-lg mb-1 lg:mb-2">
              {texts.leadIn}
            </p>
          )}
          <h1 className="text-typo-heading-1">{texts.title}</h1>
          <p className="text-typo-body-lg mx-auto mt-4 max-w-[440px] text-balance lg:mx-0 lg:mt-6">
            {texts.text}
            {hasResults && <span aria-hidden="true"> 👇</span>}
          </p>
          <OpenBookQuizButton theme="secondary" className="bg-background mt-6 lg:mt-10">
            Tag quizzen igen
          </OpenBookQuizButton>
        </div>
        {/* Room above for the burst, and below so the book does not sit on the
            edge. */}
        <div className="flex justify-center self-end pt-[104px] pb-8 lg:pt-[130px] lg:pb-10">
          {/* Keyed by the searches, so the burst plays again when the quiz is
              retaken from this page, where only the query changes. */}
          <BookQuizBurst
            key={steps.map(step => step.cql).join("|")}
            // The first step holds all the answers.
            emojis={getHeroEmojis(steps[0]?.answers ?? [])}
          />
        </div>
      </div>
      {/* A line between the sections, with the same space on both sides. Drawn
          with CSS, as a section without books is not rendered. */}
      {hasResults && (
        <div className="divide-foreground/10 divide-y">
          {steps.map(step => (
            <BookQuizSection
              key={step.id}
              answers={step.answers}
              cql={step.cql}
              ageRange={profile.ageRange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BookQuizResultLayout
