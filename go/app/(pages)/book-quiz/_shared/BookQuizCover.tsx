import React from "react"

import { BookQuizComplexSearchQuery } from "@/lib/graphql/generated/fbi/graphql"

type TQuizWork = BookQuizComplexSearchQuery["complexSearch"]["works"][number]

// Første forside-url på tværs af værkets manifestationer (bedste først).
const coverUrl = (work: TQuizWork): string | null => {
  const manifestations = [work.manifestations.bestRepresentation, ...work.manifestations.all]
  for (const manifestation of manifestations) {
    const url = manifestation.cover.thumbnail ?? manifestation.cover.xSmall?.url ?? null
    if (url) return url
  }
  return null
}

// Lille forside til PoC-resultatlisterne. Rå <img> som andre steder i repoet
// (CoverPicture) — nok til en PoC, ingen tung styling.
const BookQuizCover = ({ work }: { work: TQuizWork }) => {
  const url = coverUrl(work)
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-16 w-11 shrink-0 border border-black/10 object-cover" />
  ) : (
    <div className="h-16 w-11 shrink-0 border border-black/10 bg-black/5" />
  )
}

export default BookQuizCover
