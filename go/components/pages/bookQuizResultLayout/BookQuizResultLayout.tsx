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
  // and asks the user to take the quiz. With results the hero only points at
  // the books, and the way back into the quiz comes after them.
  const hasResults = steps.length > 0
  const texts = getHeroTexts(hasResults)
  // The first step holds all the answers.
  const answers = steps[0]?.answers ?? []
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
          {/* With answers, the heading is what they stand for: the emoji of each
              answer and the name of its group, e.g. "💣 Spænding, 😂 Sjov & 🐰
              Dyr". An emoji sits close to its name and stays on the same line.
              It is a little smaller than the letters, as emojis look bigger. */}
          <h1 className="text-typo-heading-1">
            {texts.title ??
              answers.map((option, index) => (
                <React.Fragment key={option.id}>
                  {index > 0 && (index === answers.length - 1 ? " & " : ", ")}
                  <span className="whitespace-nowrap">
                    <span
                      aria-hidden="true"
                      className="mr-[0.25em] inline-block align-[0.06em] text-[0.8em]">
                      {option.emoji}
                    </span>
                    {option.group.label}
                  </span>
                </React.Fragment>
              ))}
          </h1>
          {/* Set like the lead-in, so the two frame the heading and read as one
              message with it. */}
          <p
            className="text-typo-subtitle-md lg:text-typo-subtitle-lg mx-auto mt-3 max-w-[520px]
              text-balance lg:mx-0 lg:mt-4">
            {texts.text}
            {hasResults && <span aria-hidden="true"> 👇</span>}
          </p>
          {!hasResults && (
            <OpenBookQuizButton theme="secondary" className="bg-background mt-6 lg:mt-10">
              Tag quizzen igen
            </OpenBookQuizButton>
          )}
        </div>
        {/* Room above for the burst, and below so the book does not sit on the
            edge. */}
        <div className="flex justify-center self-end pt-[104px] pb-8 lg:pt-[130px] lg:pb-10">
          {/* Keyed by the searches, so the burst plays again when the quiz is
              retaken from this page, where only the query changes. */}
          <BookQuizBurst
            key={steps.map(step => step.cql).join("|")}
            emojis={getHeroEmojis(answers)}
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
      {/* After the books: the offer to take the quiz again, in the colours of
          the hero. Side by side from lg. */}
      {hasResults && (
        <div
          className={cn(
            QUIZ_COLOR_CLASSES[color],
            `dark:bg-background-overlay-solid relative isolate flex flex-col items-center gap-6
            overflow-hidden rounded-xl bg-(--quiz-bg) px-6 py-8 text-center lg:flex-row
            lg:justify-between lg:px-10 lg:py-10 lg:text-left`
          )}>
          <BookQuizWatermark
            className="-right-[20%] -bottom-[90%] w-[70%] lg:-right-[4%] lg:-bottom-[150%]
              lg:w-[34%]"
          />
          <div>
            <h2 className="text-typo-heading-3">Fandt du ikke noget?</h2>
            <p className="text-typo-body-lg mt-2">Tag quizzen igen og få nye forslag.</p>
          </div>
          <OpenBookQuizButton theme="secondary" className="bg-background shrink-0">
            Tag quizzen igen
          </OpenBookQuizButton>
        </div>
      )}
    </div>
  )
}

export default BookQuizResultLayout
