import React from "react"

import { Badge } from "@/components/shared/badge/Badge"
import type { TLadderPart, TLadderStep } from "@/lib/book-quiz/ladder"
import type { TBookQuizProfile } from "@/lib/book-quiz/profile"
import type { TBookQuizOption } from "@/lib/book-quiz/questions"

import BookQuizSection from "./BookQuizSection"
import OpenBookQuizButton from "./OpenBookQuizButton"
import { getStepAnswers } from "./helper"

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
  const likes = [
    ...profile.subjects.map(group => group.label),
    ...(profile.easyToRead ? ["Lette bøger"] : []),
  ]

  return (
    <div className="content-container space-y-grid-gap-3">
      <div className="bg-content-4 dark:bg-background p-grid-edge space-y-grid-gap-2 rounded-xl">
        <p className="text-typo-subtitle-lg">Din bogtype</p>
        <h1 className="text-typo-heading-3 lg:text-typo-heading-1">
          {bookType || "Dine bogforslag"}
        </h1>
        {likes.length > 0 && (
          <div className="space-y-2">
            <p className="text-typo-subtitle-sm">Vi tror, du kan lide</p>
            <ul className="flex flex-wrap gap-2">
              {likes.map(like => (
                <li key={like}>
                  <Badge variant="outline">{like}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
        <OpenBookQuizButton>Tag quizzen igen</OpenBookQuizButton>
      </div>
      {steps.map(step => (
        <BookQuizSection
          key={step.id}
          answers={getStepAnswers(step.parts, groupAnswers)}
          cql={step.cql}
          ageRange={profile.ageRange}
        />
      ))}
    </div>
  )
}

export default BookQuizResultLayout
