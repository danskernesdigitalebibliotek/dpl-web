import { Metadata } from "next"
import type { SearchParams } from "nuqs/server"

import BookQuizResultLayout from "@/components/pages/bookQuizResultLayout/BookQuizResultLayout"
import { getLadderSteps } from "@/lib/book-quiz/ladder"
import { getBookQuizProfile } from "@/lib/book-quiz/profile"
import { loadBookQuizAnswers } from "@/lib/book-quiz/url"
import { setPageMetadata } from "@/lib/helpers/helper.metadata"

export const metadata: Metadata = setPageMetadata("Dine bogforslag")

type TBookQuizPageProps = { searchParams: Promise<SearchParams> }

// The books are fetched on the client by each section. Coming from the quiz,
// the modal has already put them in the query cache, so they show at once.
const BookQuizPage = async ({ searchParams }: TBookQuizPageProps) => {
  const profile = getBookQuizProfile(await loadBookQuizAnswers(searchParams))

  return <BookQuizResultLayout profile={profile} steps={getLadderSteps(profile)} />
}

export default BookQuizPage
