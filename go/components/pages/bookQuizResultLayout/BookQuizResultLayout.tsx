import React from "react"

import BookQuizBurst from "@/components/shared/bookQuizModal/BookQuizBurst"
import BookQuizWatermark from "@/components/shared/bookQuizModal/BookQuizWatermark"
import { QUIZ_COLOR_CLASSES } from "@/components/shared/bookQuizModal/colors"
import type { TLadderPart, TLadderStep } from "@/lib/book-quiz/ladder"
import { type TBookQuizProfile, getBookQuizColor } from "@/lib/book-quiz/profile"
import type { TBookQuizOption } from "@/lib/book-quiz/questions"
import { cn } from "@/lib/helpers/helper.cn"

import BookQuizSection from "./BookQuizSection"
import OpenBookQuizButton from "./OpenBookQuizButton"
import { getHeroEmojis, getStepAnswers } from "./helper"

type TBookQuizResultLayoutProps = {
  profile: TBookQuizProfile
  steps: TLadderStep[]
  groupAnswers: Record<TLadderPart, TBookQuizOption[]>
}

const BookQuizResultLayout = ({ profile, steps, groupAnswers }: TBookQuizResultLayoutProps) => {
  // Without genre, mood or subjects there is nothing to search for, e.g. when
  // the page is opened from an old or broken link.
  if (steps.every(step => step.cql === null)) {
    return (
      <div className="content-container space-y-grid-gap-2">
        <h1 className="text-typo-heading-3 lg:text-typo-heading-2">Vi mangler dine svar</h1>
        <p className="text-typo-body-lg">Tag quizzen for at få forslag til bøger.</p>
        <OpenBookQuizButton>Tag quizzen</OpenBookQuizButton>
      </div>
    )
  }

  const bookType = [profile.genre?.label, profile.mood?.label].filter(Boolean).join(" & ")
  const color = getBookQuizColor(profile)

  return (
    <div className="content-container space-y-grid-gap-3">
      {/* The quiz's colour and watermark, with the girl from the quiz rising from
          the bottom edge and the user's answers bursting out of the flask. */}
      <div
        className={cn(
          QUIZ_COLOR_CLASSES[color].background,
          `dark:bg-background-overlay-solid px-grid-edge pt-grid-edge relative isolate grid
          items-center gap-6 overflow-hidden rounded-xl lg:grid-cols-2 lg:px-10 lg:pt-0`
        )}>
        <BookQuizWatermark
          color={color}
          className="-right-[10%] -bottom-[60%] w-[90%] lg:w-[60%]"
        />
        <div className="space-y-grid-gap-2 lg:py-10">
          <p className="text-typo-subtitle-lg">Du kan godt lide</p>
          <h1 className="text-typo-heading-3 lg:text-typo-heading-1">
            {bookType || "Dine bogforslag"}
          </h1>
          <p className="text-typo-body-lg">
            Vi har fundet bøger, der passer til dig. Du finder dem herunder.{" "}
            <span aria-hidden="true">👇</span>
          </p>
          <OpenBookQuizButton theme="secondary" className="bg-background">
            Tag quizzen igen
          </OpenBookQuizButton>
        </div>
        <div className="flex justify-center self-end pt-[110px] lg:pt-[130px]">
          {/* Keyed by the searches, so the burst plays again when the quiz is
              retaken from this page, where only the query changes. */}
          <BookQuizBurst
            key={steps.map(step => step.cql).join("|")}
            emojis={getHeroEmojis(groupAnswers)}
          />
        </div>
      </div>
      {/* A line between the sections, with the same space on both sides. */}
      <div className="space-y-grid-gap-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {index > 0 && <hr />}
            <BookQuizSection
              answers={getStepAnswers(step.parts, groupAnswers)}
              cql={step.cql}
              ageRange={profile.ageRange}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default BookQuizResultLayout
