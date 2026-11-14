"use client"

import React, { useMemo, useState } from "react"

import {
  BookQuizComplexSearchQuery,
  useBookQuizComplexSearchQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"

import BookQuizCover from "../_shared/BookQuizCover"
import { TAllowedEntry, entriesByDimension, entriesFromLabels, entryClause } from "./allowedList"
import { buildCql } from "./buildCql"

const RESULT_LIMIT = 50

// Bløde signaler (ikke en del af tilladt-listen — de sorterer resultatet).
const AGE_OPTIONS = ["fra 6 år", "fra 9 år", "fra 12 år"]
const LIX_OPTIONS = ["10", "20", "30"]
// Vises men kan ikke bruges: FBI har ingen facet for boglængde.
const LENGTH_OPTIONS = ["Kort (< 100 sider)", "Mellem (100–250)", "Lang (> 250)"]

type TQuizWork = BookQuizComplexSearchQuery["complexSearch"]["works"][number]

const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter(current => current !== value) : [...values, value]

const toNumber = (value: string) => {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : null
}

// --- Bløde signaler: rerank efter nærhed til valgt lix/alder (jf. PoC 1) ---

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

type TCheckboxGroupProps = {
  legend: string
  note?: string
  options: string[]
  selected: string[]
  onToggle?: (value: string) => void
  disabled?: boolean
}

const CheckboxGroup = ({
  legend,
  note,
  options,
  selected,
  onToggle,
  disabled = false,
}: TCheckboxGroupProps) => (
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

const labelsOf = (dimension: Parameters<typeof entriesByDimension>[0]) =>
  entriesByDimension(dimension).map(entry => entry.label)

const TilladtListeDashboard = () => {
  // Valgene er labels fra tilladt-listen — ikke rå FBI-termer.
  const [genreLabels, setGenreLabels] = useState<string[]>([])
  const [subjectLabels, setSubjectLabels] = useState<string[]>([])
  const [materialTypeLabels, setMaterialTypeLabels] = useState<string[]>([])
  // Bløde signaler.
  const [ages, setAges] = useState<string[]>([])
  const [lix, setLix] = useState<string[]>([])

  const selectedEntries: TAllowedEntry[] = entriesFromLabels([
    ...genreLabels,
    ...subjectLabels,
    ...materialTypeLabels,
  ])

  const cql = buildCql({
    genres: entriesFromLabels(genreLabels),
    subjects: entriesFromLabels(subjectLabels),
    materialTypes: entriesFromLabels(materialTypeLabels),
  })
  const hasCql = cql.length > 0

  const { data, isFetching, isError } = useBookQuizComplexSearchQuery(
    { cql, offset: 0, limit: RESULT_LIMIT, filters: {} },
    { enabled: hasCql }
  )

  const hitcount = data?.complexSearch.hitcount ?? 0
  const rawWorks = useMemo(() => data?.complexSearch.works ?? [], [data])

  const lixTargets = useMemo(() => lix.map(toNumber).filter((n): n is number => n != null), [lix])
  const ageTargets = useMemo(() => ages.map(toNumber).filter((n): n is number => n != null), [ages])
  const works = useMemo(
    () => rerankWorks(rawWorks, lixTargets, ageTargets),
    [rawWorks, lixTargets, ageTargets]
  )
  const isReranked = lixTargets.length > 0 || ageTargets.length > 0

  return (
    <section className="mx-auto my-8 flex w-full max-w-5xl flex-col gap-6 px-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Boganbefaler-quiz — PoC 2: Tilladt-liste</h1>
        <p className="opacity-70">
          Valgene kommer nu fra en kurateret tilladt-liste med børnevendte labels. Hvert label
          oversættes til de rigtige FBI-termer via sit eget indeks (term/phrase) og kan dække flere
          FBI-værdier. Bygger på PoC 1 — samme søgning og lix/alder-sortering.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-3">
          <CheckboxGroup
            legend="Genre"
            options={labelsOf("genre")}
            selected={genreLabels}
            onToggle={value => setGenreLabels(prev => toggle(prev, value))}
          />
          <CheckboxGroup
            legend="Emne"
            options={labelsOf("emne")}
            selected={subjectLabels}
            onToggle={value => setSubjectLabels(prev => toggle(prev, value))}
          />
          <CheckboxGroup
            legend="Materialetype"
            options={labelsOf("materialetype")}
            selected={materialTypeLabels}
            onToggle={value => setMaterialTypeLabels(prev => toggle(prev, value))}
          />
          <CheckboxGroup
            legend="Læsealder"
            note="blødt — sorterer"
            options={AGE_OPTIONS}
            selected={ages}
            onToggle={value => setAges(prev => toggle(prev, value))}
          />
          <CheckboxGroup
            legend="Lix"
            note="blødt — sorterer"
            options={LIX_OPTIONS}
            selected={lix}
            onToggle={value => setLix(prev => toggle(prev, value))}
          />
          <CheckboxGroup
            legend="Længde"
            note="kan ikke bruges — FBI har ingen facet for længde"
            options={LENGTH_OPTIONS}
            selected={[]}
            disabled
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold">Mapping: label → FBI-termer</h2>
            {selectedEntries.length > 0 ? (
              <ul className="flex flex-col gap-1 text-sm">
                {selectedEntries.map(entry => (
                  <li key={entry.label}>
                    <span className="font-medium">{entry.label}</span>
                    <span className="opacity-60"> ({entry.dimension})</span> →{" "}
                    <code className="bg-black/5">{entryClause(entry)}</code>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm opacity-60">— vælg et label fra listen —</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold">Genereret CQL</h2>
            <pre
              className="border border-black/20 bg-black/5 p-3 text-sm break-words
                whitespace-pre-wrap">
              {hasCql ? cql : "— vælg mindst ét filter —"}
            </pre>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold">
              Resultat: {hasCql ? `${hitcount} bøger` : "—"}
              {isFetching ? " (henter…)" : ""}
              {isReranked ? " · sorteret efter lix/alder" : ""}
            </h2>
            {isReranked && works.length > 0 ? (
              <p className="text-xs opacity-60">
                {works.filter(work => getWorkLix(work) != null || getWorkAges(work) != null).length}{" "}
                af {works.length} viste bøger har lix/alder-data (resten sorteres nederst).
              </p>
            ) : null}
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
                        {work.workYear?.display ? (
                          <span className="opacity-50"> · {work.workYear.display}</span>
                        ) : null}
                      </div>
                      <div className="opacity-50">
                        {work.materialTypes
                          .map(type => type.materialTypeSpecific.display)
                          .join(", ")}
                        {workLix != null ? ` · lix ${workLix}` : " · lix —"}
                        {workAges ? ` · ${workAges}` : " · alder —"}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            {hasCql && !isFetching && works.length === 0 ? (
              <p className="opacity-70">Ingen bøger matchede — prøv at fjerne et valg.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TilladtListeDashboard
