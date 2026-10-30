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

const RESULT_LIMIT = 50
const FACET_LIMIT = 100

// Bløde signaler (sorterer resultatet) og længde (kan ikke bruges).
const AGE_OPTIONS = ["fra 6 år", "fra 9 år", "fra 12 år"]
const LIX_OPTIONS = ["10", "20", "30"]
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

// --- Korrelation: map facet-navn → dimension ---

const facetDimension = (name: string | null | undefined): TAllowedDimension | null => {
  const lower = (name ?? "").toLowerCase()
  if (lower.includes("genre")) return "genre"
  if (lower.includes("subject")) return "emne"
  if (lower.includes("material")) return "materialetype"
  return null
}

type TCorrelatedGroupProps = {
  legend: string
  dimension: TAllowedDimension
  selected: string[]
  onToggle: (label: string) => void
  isAvailable: (entry: TAllowedEntry) => boolean
  countFor: (entry: TAllowedEntry) => number | null
}

const CorrelatedGroup = ({
  legend,
  dimension,
  selected,
  onToggle,
  isAvailable,
  countFor,
}: TCorrelatedGroupProps) => {
  const entries = [...entriesByDimension(dimension)].sort(
    (a, b) => Number(isAvailable(b)) - Number(isAvailable(a))
  )
  return (
    <fieldset className="border border-black/20 p-3">
      <legend className="px-1 text-sm font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {entries.map(entry => {
          const available = isAvailable(entry)
          const checked = selected.includes(entry.label)
          const count = countFor(entry)
          return (
            <label
              key={entry.label}
              className={`flex items-center gap-1 text-sm
              ${!available && !checked ? "opacity-30" : ""}`}>
              <input
                type="checkbox"
                checked={checked}
                disabled={!available && !checked}
                onChange={() => onToggle(entry.label)}
              />
              {entry.label}
              {count != null ? <span className="opacity-50"> ({count})</span> : null}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

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

const CorrelationDashboard = () => {
  const [genreLabels, setGenreLabels] = useState<string[]>([])
  const [subjectLabels, setSubjectLabels] = useState<string[]>([])
  const [materialTypeLabels, setMaterialTypeLabels] = useState<string[]>([])
  const [ages, setAges] = useState<string[]>([])
  const [lix, setLix] = useState<string[]>([])

  const cql = buildCql({
    genres: entriesFromLabels(genreLabels),
    subjects: entriesFromLabels(subjectLabels),
    materialTypes: entriesFromLabels(materialTypeLabels),
  })
  const hasCql = cql.length > 0
  const allSelected = [...genreLabels, ...subjectLabels, ...materialTypeLabels]

  const { data, isFetching, isError } = useBookQuizComplexSearchQuery(
    { cql, offset: 0, limit: RESULT_LIMIT, filters: {} },
    { enabled: hasCql }
  )
  const { data: facetData } = useBookQuizComplexFacetsQuery(
    {
      cql,
      facets: {
        facetLimit: FACET_LIMIT,
        facets: ["GENREANDFORM", "SUBJECT", "SPECIFICMATERIALTYPE"],
      },
      filters: {},
    },
    { enabled: hasCql }
  )

  const { terms, counts } = useMemo(() => {
    const terms: Record<TAllowedDimension, Set<string>> = {
      genre: new Set<string>(),
      emne: new Set<string>(),
      materialetype: new Set<string>(),
    }
    const counts = new Map<string, number>()
    for (const facet of facetData?.complexSearch.facets ?? []) {
      const dimension = facetDimension(facet.name)
      if (!dimension) continue
      for (const value of facet.values ?? []) {
        terms[dimension].add(value.key)
        counts.set(value.key, value.score)
      }
    }
    return { terms, counts }
  }, [facetData])

  const hasFacets = (facetData?.complexSearch.facets?.length ?? 0) > 0

  const isAvailable = (entry: TAllowedEntry) =>
    !hasCql ||
    !hasFacets ||
    allSelected.includes(entry.label) ||
    entry.cqlValues.some(value => terms[entry.dimension].has(value))

  const countFor = (entry: TAllowedEntry) => {
    const scores = entry.cqlValues
      .map(value => counts.get(value))
      .filter((n): n is number => n != null)
    return scores.length > 0 ? Math.max(...scores) : null
  }

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
        <h1 className="text-2xl font-bold">Boganbefaler-quiz — PoC 3: Korrelation</h1>
        <p className="opacity-70">
          De tilbudte valg afhænger nu af det allerede valgte: kun genrer/emner/materialetyper, der
          faktisk optræder sammen med dit valg, kan vælges (tallet er antal bøger). Nedtonede valg
          findes ikke sammen med det valgte. Bygger på PoC 2.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-3">
          <CorrelatedGroup
            legend="Genre"
            dimension="genre"
            selected={genreLabels}
            onToggle={value => setGenreLabels(prev => toggle(prev, value))}
            isAvailable={isAvailable}
            countFor={countFor}
          />
          <CorrelatedGroup
            legend="Emne"
            dimension="emne"
            selected={subjectLabels}
            onToggle={value => setSubjectLabels(prev => toggle(prev, value))}
            isAvailable={isAvailable}
            countFor={countFor}
          />
          <CorrelatedGroup
            legend="Materialetype"
            dimension="materialetype"
            selected={materialTypeLabels}
            onToggle={value => setMaterialTypeLabels(prev => toggle(prev, value))}
            isAvailable={isAvailable}
            countFor={countFor}
          />
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

        <div className="flex flex-col gap-4">
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

export default CorrelationDashboard
