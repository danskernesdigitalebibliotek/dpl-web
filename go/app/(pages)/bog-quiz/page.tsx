import { Metadata } from "next"
import type { SearchParams } from "nuqs/server"

import BookQuizResultLayout from "@/components/pages/bookQuizResultLayout/BookQuizResultLayout"
import { getLadderSteps } from "@/lib/book-quiz/ladder"
import { getBookQuizProfile, getGroupAnswers } from "@/lib/book-quiz/profile"
import { loadBookQuizAnswers } from "@/lib/book-quiz/url"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

export const metadata: Metadata = setPageMetadata("Dine bogforslag")

type TBookQuizPageProps = { searchParams: Promise<SearchParams> }

// The books are fetched on the client by each section. Coming from the quiz,
// the modal has already put them in the query cache, so they show at once.
const BookQuizPage = async ({ searchParams }: TBookQuizPageProps) => {
  const answers = await loadBookQuizAnswers(searchParams)
  const profile = getBookQuizProfile(answers)

  return (
    <BookQuizResultLayout
      profile={profile}
      steps={getLadderSteps(profile)}
      groupAnswers={getGroupAnswers(answers)}
    />
  )
}

export default BookQuizPage
