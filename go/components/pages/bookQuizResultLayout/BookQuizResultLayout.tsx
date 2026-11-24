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
          the bottom edge and the user's answers bursting out around her. */}
      <div
        className={cn(
          QUIZ_COLOR_CLASSES[color],
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
          <p className="text-typo-subtitle-md lg:text-typo-subtitle-lg">Du kan godt lide</p>
          <h1 className="text-typo-heading-1 mt-1 lg:mt-2">{bookType || "Dine bogforslag"}</h1>
          <p className="text-typo-body-lg mx-auto mt-4 max-w-[440px] text-balance lg:mx-0 lg:mt-6">
            Vi har fundet bøger, der passer til dig. Du finder dem herunder.{" "}
            <span aria-hidden="true">👇</span>
          </p>
          <OpenBookQuizButton theme="secondary" className="bg-background mt-6 lg:mt-10">
            Tag quizzen igen
          </OpenBookQuizButton>
        </div>
        <div className="flex justify-center self-end pt-[104px] lg:pt-[130px]">
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
