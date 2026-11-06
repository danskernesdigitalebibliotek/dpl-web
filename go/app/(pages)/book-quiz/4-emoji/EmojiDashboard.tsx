"use client"

import React, { useMemo, useState } from "react"

import {
  BookQuizComplexSearchQuery,
  useBookQuizComplexFacetsQuery,
  useBookQuizComplexSearchQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"

import {
  TAllowedDimension,
  TAllowedEntry,
  entriesByDimension,
  entriesFromLabels,
} from "../2-tilladt-liste/allowedList"
import { buildCql } from "../2-tilladt-liste/buildCql"
import BookQuizCover from "../_shared/BookQuizCover"

const RESULT_LIMIT = 30
const FACET_LIMIT = 100

// Læsepræferencer: bløde signaler (sorterer resultatet) og længde (kan ikke
// bruges — FBI har ingen facet for boglængde). Jf. PoC 3.
const AGE_OPTIONS = ["fra 6 år", "fra 9 år", "fra 12 år"]
const LIX_OPTIONS = ["10", "20", "30"]
const LENGTH_OPTIONS = ["Kort (< 100 sider)", "Mellem (100–250)", "Lang (> 250)"]

type TStep = "genre" | "emne" | "resultat"
type TQuizWork = BookQuizComplexSearchQuery["complexSearch"]["works"][number]

const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter(current => current !== value) : [...values, value]

const toNumber = (value: string) => {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : null
}

// Kun poster med en emoji er med i emoji-quizzen (jf. allowedList).
const emojiEntries = (dimension: TAllowedDimension) =>
  entriesByDimension(dimension).filter(entry => entry.emojis?.length)

// --- Bløde signaler: rerank efter nærhed til valgt lix/alder (jf. PoC 3) ---

const getWorkAudiences = (work: TQuizWork) => {
  const audiences = [
    work.manifestations.bestRepresentation.audience,
    ...work.manifestations.all.map(manifestation => manifestation.audience),
  ]
  return audiences.filter((audience): audience is NonNullable<(typeof audiences)[number]> =>
    Boolean(audience)
  )
}

const getWorkLix = (work: TQuizWork): number | null => {
  for (const audience of getWorkAudiences(work)) {
    const parsed = audience.lix ? Number(audience.lix) : NaN
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const getWorkAges = (work: TQuizWork): { begin: number | null; end: number | null } | null => {
  for (const audience of getWorkAudiences(work)) {
    const begins = audience.ages.map(range => range.begin).filter((n): n is number => n != null)
    const ends = audience.ages.map(range => range.end).filter((n): n is number => n != null)
    if (begins.length > 0 || ends.length > 0) {
      return {
        begin: begins.length > 0 ? Math.min(...begins) : null,
        end: ends.length > 0 ? Math.max(...ends) : null,
      }
    }
  }
  return null
}

const lixDistance = (value: number, targets: number[]) =>
  Math.min(...targets.map(target => Math.abs(value - target)))

const ageDistance = (range: { begin: number | null; end: number | null }, targets: number[]) =>
  Math.min(
    ...targets.map(target => {
      const low = range.begin ?? range.end
      const high = range.end ?? range.begin
      if (low == null || high == null) return Infinity
      if (target < low) return low - target
      if (target > high) return target - high
      return 0
    })
  )

const rerankWorks = (works: TQuizWork[], lixTargets: number[], ageTargets: number[]) => {
  if (lixTargets.length === 0 && ageTargets.length === 0) return works
  return works
    .map((work, index) => {
      const distances: number[] = []
      if (lixTargets.length > 0) {
        const lix = getWorkLix(work)
        if (lix != null) distances.push(lixDistance(lix, lixTargets))
      }
      if (ageTargets.length > 0) {
        const ages = getWorkAges(work)
        if (ages) distances.push(ageDistance(ages, ageTargets))
      }
      const hasData = distances.length > 0
      const distance = hasData
        ? distances.reduce((sum, value) => sum + value, 0) / distances.length
        : Infinity
      return { work, index, hasData, distance }
    })
    .sort((a, b) => {
      if (a.hasData !== b.hasData) return a.hasData ? -1 : 1
      if (a.distance !== b.distance) return a.distance - b.distance
      return a.index - b.index
    })
    .map(entry => entry.work)
}

const formatAges = (work: TQuizWork): string | null => {
  const ages = getWorkAges(work)
  if (!ages) return null
  if (ages.begin != null && ages.end != null) return `${ages.begin}–${ages.end} år`
  if (ages.begin != null) return `fra ${ages.begin} år`
  return `til ${ages.end} år`
}

type TEmojiButtonProps = {
  entry: TAllowedEntry
  selected: boolean
  disabled: boolean
  onClick: () => void
}

const EmojiButton = ({ entry, selected, disabled, onClick }: TEmojiButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled && !selected}
    aria-pressed={selected}
    className={[
      "flex w-24 flex-col items-center gap-1 border p-3 text-center",
      selected ? "border-black bg-black/10" : "border-black/20",
      disabled && !selected ? "cursor-not-allowed opacity-30" : "hover:bg-black/5",
    ].join(" ")}>
    <span className="text-3xl leading-none">{entry.emojis?.[0]}</span>
    <span className="text-xs">{entry.label}</span>
  </button>
)

type TSoftGroupProps = {
  legend: string
  note?: string
  options: string[]
  selected: string[]
  onToggle?: (value: string) => void
  disabled?: boolean
}

const SoftGroup = ({
  legend,
  note,
  options,
  selected,
  onToggle,
  disabled = false,
}: TSoftGroupProps) => (
  <fieldset className="border border-black/20 p-3" disabled={disabled}>
    <legend className="px-1 text-sm font-bold">
      {legend}
      {note ? <span className="font-normal opacity-60"> — {note}</span> : null}
    </legend>
    <div className={`flex flex-wrap gap-x-4 gap-y-1 ${disabled ? "opacity-40" : ""}`}>
      {options.map(option => (
        <label key={option} className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            disabled={disabled}
            onChange={() => onToggle?.(option)}
          />
          {option}
        </label>
      ))}
    </div>
  </fieldset>
)

const EmojiDashboard = () => {
  const [step, setStep] = useState<TStep>("genre")
  const [genreLabels, setGenreLabels] = useState<string[]>([])
  const [subjectLabels, setSubjectLabels] = useState<string[]>([])
  const [ages, setAges] = useState<string[]>([])
  const [lix, setLix] = useState<string[]>([])

  const genres = entriesFromLabels(genreLabels)
  const subjects = entriesFromLabels(subjectLabels)

  // Korrelation (fra PoC 3): på emne-trinnet tilbydes kun emner, der faktisk
  // optræder sammen med de valgte genrer. Facetterne hentes for genre-CQL'en.
  const genreCql = buildCql({ genres, subjects: [], materialTypes: [] })
  const { data: facetData } = useBookQuizComplexFacetsQuery(
    {
      cql: genreCql,
      facets: { facetLimit: FACET_LIMIT, facets: ["SUBJECT"] },
      filters: {},
    },
    { enabled: step === "emne" && genreCql.length > 0 }
  )
  const subjectTerms = useMemo(() => {
    const terms = new Set<string>()
    for (const facet of facetData?.complexSearch.facets ?? []) {
      for (const value of facet.values ?? []) terms.add(value.key)
    }
    return terms
  }, [facetData])
  const hasSubjectFacets = subjectTerms.size > 0

  const subjectAvailable = (entry: TAllowedEntry) =>
    genreCql.length === 0 ||
    !hasSubjectFacets ||
    subjectLabels.includes(entry.label) ||
    entry.cqlValues.some(value => subjectTerms.has(value))

  // Resultat: fuld CQL (genrer + emner), samme søgning som PoC 2/3.
  const cql = buildCql({ genres, subjects, materialTypes: [] })
  const hasCql = cql.length > 0
  const { data, isFetching, isError } = useBookQuizComplexSearchQuery(
    { cql, offset: 0, limit: RESULT_LIMIT, filters: {} },
    { enabled: hasCql }
  )
  const hitcount = data?.complexSearch.hitcount ?? 0

  // Læsepræferencer reranker resultatet (blødt — filtrerer ikke).
  const rawWorks = useMemo(() => data?.complexSearch.works ?? [], [data])
  const lixTargets = useMemo(() => lix.map(toNumber).filter((n): n is number => n != null), [lix])
  const ageTargets = useMemo(() => ages.map(toNumber).filter((n): n is number => n != null), [ages])
  const works = useMemo(
    () => rerankWorks(rawWorks, lixTargets, ageTargets),
    [rawWorks, lixTargets, ageTargets]
  )
  const isReranked = lixTargets.length > 0 || ageTargets.length > 0

  const reset = () => {
    setGenreLabels([])
    setSubjectLabels([])
    setAges([])
    setLix([])
    setStep("genre")
  }

  const stepLabel =
    step === "genre" ? "1/3 — Genre" : step === "emne" ? "2/3 — Emne" : "3/3 — Bøger"

  return (
    <section className="mx-auto my-8 flex w-full max-w-5xl flex-col gap-6 px-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Boganbefaler-quiz — PoC 4: Emoji</h1>
        <p className="opacity-70">
          Samme søgning som PoC 2/3, men barnet vælger med emojis i to trin: først genre, så emne.
          Flere emojis kan vælges. Emne-trinnet nedtoner valg, der ikke findes sammen med de valgte
          genrer (korrelation fra PoC 3). Læsepræferencer sorterer resultatet. Bygger på PoC 3.
        </p>
        <p className="text-sm opacity-50">Trin: {stepLabel}</p>
      </header>

      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold">Genereret CQL (opdateres løbende)</h2>
        <pre
          className="border border-black/20 bg-black/5 p-3 text-sm break-words whitespace-pre-wrap">
          {hasCql ? cql : "— vælg mindst én emoji —"}
        </pre>
      </div>

      {step === "genre" ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold">Hvad er du i humør til?</h2>
          <div className="flex flex-wrap gap-2">
            {emojiEntries("genre").map(entry => (
              <EmojiButton
                key={entry.label}
                entry={entry}
                selected={genreLabels.includes(entry.label)}
                disabled={false}
                onClick={() => setGenreLabels(prev => toggle(prev, entry.label))}
              />
            ))}
          </div>
          <div>
            <button
              type="button"
              className="border border-black px-4 py-2 disabled:opacity-30"
              disabled={genreLabels.length === 0}
              onClick={() => setStep("emne")}>
              Næste →
            </button>
          </div>
        </div>
      ) : null}

      {step === "emne" ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold">Hvad skal den handle om?</h2>
          <div className="flex flex-wrap gap-2">
            {emojiEntries("emne").map(entry => (
              <EmojiButton
                key={entry.label}
                entry={entry}
                selected={subjectLabels.includes(entry.label)}
                disabled={!subjectAvailable(entry)}
                onClick={() => setSubjectLabels(prev => toggle(prev, entry.label))}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="border border-black/40 px-4 py-2"
              onClick={() => setStep("genre")}>
              ← Tilbage
            </button>
            <button
              type="button"
              className="border border-black px-4 py-2"
              onClick={() => setStep("resultat")}>
              Vis bøger →
            </button>
          </div>
        </div>
      ) : null}

      {step === "resultat" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[...genres, ...subjects].map(entry => (
              <span key={entry.label} className="border border-black/20 px-2 py-1 text-sm">
                {entry.emojis?.[0]} {entry.label}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold">Læsepræferencer</h2>
            <SoftGroup
              legend="Læsealder"
              note="blødt — sorterer"
              options={AGE_OPTIONS}
              selected={ages}
              onToggle={value => setAges(prev => toggle(prev, value))}
            />
            <SoftGroup
              legend="Lix"
              note="blødt — sorterer"
              options={LIX_OPTIONS}
              selected={lix}
              onToggle={value => setLix(prev => toggle(prev, value))}
            />
            <SoftGroup
              legend="Længde"
              note="kan ikke bruges — FBI har ingen facet for længde"
              options={LENGTH_OPTIONS}
              selected={[]}
              disabled
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="border border-black/40 px-4 py-2"
              onClick={() => setStep("emne")}>
              ← Tilbage
            </button>
            <button type="button" className="border border-black px-4 py-2" onClick={reset}>
              Start forfra
            </button>
          </div>
        </div>
      ) : null}

      {hasCql ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-bold">
            {`${hitcount} bøger`}
            {isFetching ? " (henter…)" : ""}
            {isReranked ? " · sorteret efter lix/alder" : ""}
          </h2>
          {isError ? <p className="text-red-700">Fejl ved søgning i FBI.</p> : null}
          <ul className="flex flex-col divide-y divide-black/10">
            {works.map(work => {
              const workLix = getWorkLix(work)
              const workAges = formatAges(work)
              return (
                <li key={work.workId} className="flex items-start gap-3 py-2 text-sm">
                  <BookQuizCover work={work} />
                  <div className="flex min-w-0 flex-col">
                    <div>
                      <span className="font-medium">{work.titles.full[0] ?? "Uden titel"}</span>
                      {work.creators.length > 0 ? (
                        <span className="opacity-70"> · {displayCreators(work.creators, 2)}</span>
                      ) : null}
                    </div>
                    <div className="opacity-50">
                      {work.materialTypes.map(type => type.materialTypeSpecific.display).join(", ")}
                      {workLix != null ? ` · lix ${workLix}` : " · lix —"}
                      {workAges ? ` · ${workAges}` : " · alder —"}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          {!isFetching && works.length === 0 ? (
            <p className="opacity-70">Ingen bøger matchede — prøv at ændre dine valg.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export default EmojiDashboard
