"use client"

import React, { useEffect, useMemo, useState } from "react"

import {
  BookQuizComplexSearchQuery,
  useBookQuizComplexSearchQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"

import { TFilterMode, withHardAudienceFilters } from "../_shared/audienceCql"
import BookQuizCover from "../_shared/BookQuizCover"
import { buildQueries } from "./buildCql"
import {
  GENRE_GROUPS,
  SUBJECT_GROUPS,
  TClauseGroup,
  TGenreGroup,
  TGroupVariant,
  TSubjectGroup,
} from "./groups"
import { QUESTIONS, TQuizOption, TQuizQuestion, TRange } from "./questions"

const RESULT_LIMIT = 30

type TPhase = "quiz" | "loading" | "result"
type TQuizWork = BookQuizComplexSearchQuery["complexSearch"]["works"][number]

// --- Værk-metadata: lix (tal) og alders-interval (begin–end) på tværs af alle
// manifestationer (lix/alder er ofte kun sat på den fysiske udgave). ---

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

const getWorkAges = (work: TQuizWork): { low: number; high: number } | null => {
  for (const audience of getWorkAudiences(work)) {
    const begins = audience.ages.map(range => range.begin).filter((n): n is number => n != null)
    const ends = audience.ages.map(range => range.end).filter((n): n is number => n != null)
    if (begins.length > 0 || ends.length > 0) {
      const low = begins.length > 0 ? Math.min(...begins) : Math.min(...ends)
      const high = ends.length > 0 ? Math.max(...ends) : Math.max(...begins)
      return { low, high }
    }
  }
  return null
}

const formatAges = (work: TQuizWork): string | null => {
  const ages = getWorkAges(work)
  if (!ages) return null
  if (ages.low === ages.high) return `${ages.low} år`
  return `${ages.low}–${ages.high} år`
}

// --- Interval-afstand (blødt) og -overlap (hårdt) ---

const lixDistance = (value: number, ranges: TRange[]) =>
  Math.min(...ranges.map(([lo, hi]) => (value < lo ? lo - value : value > hi ? value - hi : 0)))

const ageDistance = (ages: { low: number; high: number }, ranges: TRange[]) =>
  Math.min(...ranges.map(([lo, hi]) => Math.max(0, Math.max(ages.low, lo) - Math.min(ages.high, hi))))

// Blødt: sortér værker tættest på de valgte intervaller øverst (uden data nederst).
const rerankWorks = (works: TQuizWork[], lixRanges: TRange[], ageRanges: TRange[]) => {
  if (lixRanges.length === 0 && ageRanges.length === 0) return works
  return works
    .map((work, index) => {
      const distances: number[] = []
      if (lixRanges.length > 0) {
        const lix = getWorkLix(work)
        if (lix != null) distances.push(lixDistance(lix, lixRanges))
      }
      if (ageRanges.length > 0) {
        const ages = getWorkAges(work)
        if (ages) distances.push(ageDistance(ages, ageRanges))
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

// Hvad et svar peger på (vises som indsigt under hvert valg). Slår pakke-labels
// op i den (redigerbare) pakke-state.
const optionMapping = (
  option: TQuizOption,
  genrePackages: TGenreGroup[],
  subjectPackages: TSubjectGroup[]
): string => {
  if (option.genreGroupId) {
    const group = genrePackages.find(current => current.id === option.genreGroupId)
    return `genregruppe: ${group?.label ?? option.genreGroupId}`
  }
  if (option.subjectGroupId) {
    const group = subjectPackages.find(current => current.id === option.subjectGroupId)
    return `emnegruppe: ${group?.label ?? option.subjectGroupId}`
  }
  if (option.ageRange) return `alder ${option.ageRange[0]}–${option.ageRange[1]} år`
  if (option.lixRange) return `lix ${option.lixRange[0]}–${option.lixRange[1]}`
  return "—"
}

// Udled de valgte grupper + alders-/lix-intervaller fra svarene. Grupperne
// resolves mod den redigerbare pakke-state, så debug-redigeringer slår igennem.
const deriveSelection = (
  answers: Record<string, string[]>,
  genrePackages: TGenreGroup[],
  subjectPackages: TSubjectGroup[]
) => {
  const selected = QUESTIONS.flatMap(question =>
    (answers[question.id] ?? []).flatMap(id => {
      const option = question.options.find(current => current.id === id)
      return option ? [option] : []
    })
  )

  const genreGroups: TGenreGroup[] = []
  for (const option of selected) {
    const group = option.genreGroupId
      ? genrePackages.find(current => current.id === option.genreGroupId)
      : undefined
    if (group && !genreGroups.some(current => current.id === group.id)) genreGroups.push(group)
  }

  const subjectGroups: TSubjectGroup[] = []
  for (const option of selected) {
    const group = option.subjectGroupId
      ? subjectPackages.find(current => current.id === option.subjectGroupId)
      : undefined
    if (group && !subjectGroups.some(current => current.id === group.id)) subjectGroups.push(group)
  }

  const ageRanges = selected.flatMap(option => (option.ageRange ? [option.ageRange] : []))
  const lixRanges = selected.flatMap(option => (option.lixRange ? [option.lixRange] : []))

  return { genreGroups, subjectGroups, ageRanges, lixRanges }
}

const formatRanges = (ranges: TRange[], unit: string) =>
  ranges.length > 0 ? ranges.map(([lo, hi]) => `${lo}–${hi}${unit}`).join(", ") : "—"

// --- Redigerbare pakker (debug): facetter ⇄ flade termer + dyb kopi + editor ---

const INDEX_OPTIONS = [
  "term.genreandform",
  "phrase.genreandform",
  "term.subject",
  "phrase.subject",
]
const INDEX_LABEL: Record<string, string> = {
  "term.genreandform": "genre (term)",
  "phrase.genreandform": "genre (frase)",
  "term.subject": "emne (term)",
  "phrase.subject": "emne (frase)",
}

type TTerm = { index: string; value: string }

const clausesToTerms = (clauses: TClauseGroup[]): TTerm[] =>
  clauses.flatMap(clause => clause.cqlValues.map(value => ({ index: clause.cqlIndex, value })))

// Flade termer → TClauseGroup[] (grupperet pr. indeks, tomme værdier droppes).
const termsToClauses = (terms: TTerm[]): TClauseGroup[] => {
  const out: TClauseGroup[] = []
  for (const term of terms) {
    if (term.value.trim() === "") continue
    const existing = out.find(clause => clause.cqlIndex === term.index)
    if (existing) existing.cqlValues.push(term.value)
    else out.push({ cqlIndex: term.index, cqlValues: [term.value] })
  }
  return out
}

const cloneGenre = (groups: TGenreGroup[]): TGenreGroup[] =>
  groups.map(group => ({
    ...group,
    genreOnly: group.genreOnly.map(clause => ({ ...clause, cqlValues: [...clause.cqlValues] })),
    genrePlusSubjects: group.genrePlusSubjects.map(clause => ({
      ...clause,
      cqlValues: [...clause.cqlValues],
    })),
  }))

const cloneSubject = (groups: TSubjectGroup[]): TSubjectGroup[] =>
  groups.map(group => ({
    ...group,
    match: group.match.map(clause => ({ ...clause, cqlValues: [...clause.cqlValues] })),
  }))

// Editor for én liste af facetter. Holder egen flade term-state (så rækkerne ikke
// hopper mens man skriver); sender rebuilt clauses opad ved hver ændring.
const ClauseEditor = ({
  initial,
  onChange,
}: {
  initial: TClauseGroup[]
  onChange: (clauses: TClauseGroup[]) => void
}) => {
  const [terms, setTerms] = useState<TTerm[]>(() => clausesToTerms(initial))
  const apply = (next: TTerm[]) => {
    setTerms(next)
    onChange(termsToClauses(next))
  }
  return (
    <div className="flex flex-col gap-1">
      {terms.map((term, index) => (
        <div key={index} className="flex flex-wrap items-center gap-1">
          <select
            value={term.index}
            onChange={event =>
              apply(terms.map((t, i) => (i === index ? { ...t, index: event.target.value } : t)))
            }
            className="border border-black/30 px-1 py-0.5 text-xs">
            {INDEX_OPTIONS.map(option => (
              <option key={option} value={option}>
                {INDEX_LABEL[option]}
              </option>
            ))}
          </select>
          <input
            value={term.value}
            placeholder="FBI-term"
            onChange={event =>
              apply(terms.map((t, i) => (i === index ? { ...t, value: event.target.value } : t)))
            }
            className="w-40 border border-black/30 px-1 py-0.5 text-xs"
          />
          <button
            type="button"
            aria-label="Fjern term"
            onClick={() => apply(terms.filter((_, i) => i !== index))}
            className="opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => apply([...terms, { index: "term.subject", value: "" }])}
        className="self-start border border-black/30 px-2 py-0.5 text-xs">
        + term
      </button>
    </div>
  )
}

const GruppeDashboard = () => {
  const [phase, setPhase] = useState<TPhase>("quiz")
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})

  const [variant, setVariant] = useState<TGroupVariant>("genreOnly")
  const [ageMode, setAgeMode] = useState<TFilterMode>("soft")
  const [lixMode, setLixMode] = useState<TFilterMode>("soft")
  const [showInsight, setShowInsight] = useState(true)
  const [showDebug, setShowDebug] = useState(false)

  // Redigerbare kopier af pakke-katalogerne (debug). resetSeq remounter editorerne.
  const [genrePackages, setGenrePackages] = useState<TGenreGroup[]>(() => cloneGenre(GENRE_GROUPS))
  const [subjectPackages, setSubjectPackages] = useState<TSubjectGroup[]>(() =>
    cloneSubject(SUBJECT_GROUPS)
  )
  const [resetSeq, setResetSeq] = useState(0)

  const setGenreSlot = (id: string, slot: TGroupVariant, clauses: TClauseGroup[]) =>
    setGenrePackages(prev => prev.map(group => (group.id === id ? { ...group, [slot]: clauses } : group)))
  const setGenreLabel = (id: string, label: string) =>
    setGenrePackages(prev => prev.map(group => (group.id === id ? { ...group, label } : group)))
  const setSubjectMatch = (id: string, clauses: TClauseGroup[]) =>
    setSubjectPackages(prev => prev.map(group => (group.id === id ? { ...group, match: clauses } : group)))
  const setSubjectLabel = (id: string, label: string) =>
    setSubjectPackages(prev => prev.map(group => (group.id === id ? { ...group, label } : group)))
  const resetPackages = () => {
    setGenrePackages(cloneGenre(GENRE_GROUPS))
    setSubjectPackages(cloneSubject(SUBJECT_GROUPS))
    setResetSeq(seq => seq + 1)
  }

  const { genreGroups, subjectGroups, ageRanges, lixRanges } = deriveSelection(
    answers,
    genrePackages,
    subjectPackages
  )

  // Én query pr. genregruppe (altså to lister). buildQueries honorerer variant.
  // Hårde alder/lix-filtre AND'es direkte ind i CQL'en (blødt = rerank client-side).
  const queries = useMemo(() => {
    const base = buildQueries(genreGroups, subjectGroups, variant)
    const opts = { ageRanges, lixRanges, ageMode, lixMode }
    return base.map(query => ({
      group: query.group,
      cql: withHardAudienceFilters(query.cql, opts),
    }))
  }, [genreGroups, subjectGroups, variant, ageRanges, lixRanges, ageMode, lixMode])
  const cqlA = queries[0]?.cql ?? ""
  const cqlB = queries[1]?.cql ?? ""

  // Kun bløde dimensioner rerankes client-side; hårde ligger i CQL'en.
  const softAgeRanges = ageMode === "soft" ? ageRanges : []
  const softLixRanges = lixMode === "soft" ? lixRanges : []

  const resultA = useBookQuizComplexSearchQuery(
    { cql: cqlA, offset: 0, limit: RESULT_LIMIT, filters: {} },
    { enabled: phase === "result" && cqlA.length > 0 }
  )
  const resultB = useBookQuizComplexSearchQuery(
    { cql: cqlB, offset: 0, limit: RESULT_LIMIT, filters: {} },
    { enabled: phase === "result" && cqlB.length > 0 }
  )

  // "Vi har næsten noget" — kort overgang før resultatet.
  useEffect(() => {
    if (phase !== "loading") return
    const timer = setTimeout(() => setPhase("result"), 1200)
    return () => clearTimeout(timer)
  }, [phase])

  const question = QUESTIONS[qIndex]
  const chosenIds = answers[question.id] ?? []

  const select = (current: TQuizQuestion, optionId: string) => {
    setAnswers(prev => {
      const existing = prev[current.id] ?? []
      if (current.multi) {
        return {
          ...prev,
          [current.id]: existing.includes(optionId)
            ? existing.filter(id => id !== optionId)
            : [...existing, optionId],
        }
      }
      return { ...prev, [current.id]: [optionId] }
    })
  }

  const next = () => {
    if (qIndex < QUESTIONS.length - 1) setQIndex(qIndex + 1)
    else setPhase("loading")
  }
  const back = () => {
    if (qIndex > 0) setQIndex(qIndex - 1)
  }
  const reset = () => {
    setAnswers({})
    setQIndex(0)
    setPhase("quiz")
  }

  // Et resultat pr. genre-liste. Hårde filtre er allerede i CQL'en; her rerankes
  // kun de bløde dimensioner client-side.
  const buildList = (result: typeof resultA) => {
    const raw = result.data?.complexSearch.works ?? []
    return {
      works: rerankWorks(raw, softLixRanges, softAgeRanges),
      hitcount: result.data?.complexSearch.hitcount ?? 0,
      isFetching: result.isFetching,
      isError: result.isError,
    }
  }

  const lists = queries.map((query, index) => ({
    group: query.group,
    cql: query.cql,
    ...buildList(index === 0 ? resultA : resultB),
  }))

  const isReranked = softLixRanges.length > 0 || softAgeRanges.length > 0
  const anyHard =
    (ageMode === "hard" && ageRanges.length > 0) || (lixMode === "hard" && lixRanges.length > 0)

  const renderBook = (work: TQuizWork) => {
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
  }

  const isOptionSelected = (option: TQuizOption) => chosenIds.includes(option.id)

  return (
    <section className="mx-auto my-8 flex w-full max-w-4xl flex-col gap-6 px-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Boganbefaler-quiz — PoC 8: Genre- &amp; emnegrupper</h1>
        <p className="opacity-70">
          Kurateringen sker i grupper: en genre-/emnegruppe samler mange FBI-facetter under ét navn,
          og hvert svar peger på præcis én gruppe. To separate genre-spørgsmål giver to genregrupper;
          emne-spørgsmålet giver mange emner. Resultatet vises som to lister — én pr. genregruppe,
          hver AND&apos;et med alle de valgte emner. Alder og lix er intervaller, der kan bruges blødt
          (sortér) eller hårdt (filtrér). Genregrupper findes i to variationer (kun genre / genre +
          emner), der kan A/B-sammenlignes.
        </p>
      </header>

      <div className="flex flex-col border border-black/20">
        <div
          className="flex items-center justify-between border-b border-black/10 bg-black/[0.02] px-4
            py-2 text-sm">
          <span>Læsefavoritter</span>
          <button type="button" onClick={reset} aria-label="Luk og start forfra">
            ✕
          </button>
        </div>

        <div className="flex min-h-[320px] flex-col px-4 py-8">
          {phase === "quiz" ? (
            <div className="flex flex-col items-center gap-6">
              <h2 className="text-center text-xl font-bold">{question.title}</h2>
              {question.multi ? <p className="text-sm opacity-50">Vælg en eller flere</p> : null}
              <div className="flex flex-col items-center gap-3">
                {question.options.map(option => {
                  const selected = isOptionSelected(option)
                  return (
                    <div key={option.id} className="flex flex-col items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => select(question, option.id)}
                        aria-pressed={selected}
                        className={[
                          "rounded-full border px-5 py-2 text-sm",
                          selected ? "border-black bg-black/10" : "border-black/30 hover:bg-black/5",
                        ].join(" ")}>
                        {option.emoji ? <span className="mr-1">{option.emoji}</span> : null}
                        {option.label}
                      </button>
                      <span className="text-[10px] opacity-50">
                        → {optionMapping(option, genrePackages, subjectPackages)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          {phase === "loading" ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="text-3xl">👻 🧙 😱 🏰 🚀</div>
              <p className="text-xs font-bold tracking-widest uppercase opacity-60">
                Finder dit næste eventyr
              </p>
              <h2 className="text-2xl font-bold">Vi har næsten noget.</h2>
              <p className="opacity-60">Bare lige ét sidste helt uvidenskabeligt tjek.</p>
            </div>
          ) : null}

          {phase === "result" ? (
            <div className="flex flex-col gap-6">
              {/* Styring: variant (A/B) + alder/lix soft/hard — gælder begge lister. */}
              <div className="flex flex-wrap items-center gap-4 border border-black/20 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Genre-variant:</span>
                  <button
                    type="button"
                    onClick={() => setVariant("genreOnly")}
                    aria-pressed={variant === "genreOnly"}
                    className={[
                      "border px-2 py-0.5",
                      variant === "genreOnly" ? "border-black bg-black/10" : "border-black/30",
                    ].join(" ")}>
                    A · kun genre
                  </button>
                  <button
                    type="button"
                    onClick={() => setVariant("genrePlusSubjects")}
                    aria-pressed={variant === "genrePlusSubjects"}
                    className={[
                      "border px-2 py-0.5",
                      variant === "genrePlusSubjects"
                        ? "border-black bg-black/10"
                        : "border-black/30",
                    ].join(" ")}>
                    B · genre + emner
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Alder:</span>
                  <button
                    type="button"
                    onClick={() => setAgeMode(mode => (mode === "soft" ? "hard" : "soft"))}
                    aria-pressed={ageMode === "hard"}
                    className={[
                      "border px-2 py-0.5",
                      ageMode === "hard" ? "border-black bg-black/10" : "border-black/30",
                    ].join(" ")}>
                    {ageMode === "hard" ? "hårdt filter" : "blødt (sortér)"}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Lix:</span>
                  <button
                    type="button"
                    onClick={() => setLixMode(mode => (mode === "soft" ? "hard" : "soft"))}
                    aria-pressed={lixMode === "hard"}
                    className={[
                      "border px-2 py-0.5",
                      lixMode === "hard" ? "border-black bg-black/10" : "border-black/30",
                    ].join(" ")}>
                    {lixMode === "hard" ? "hårdt filter" : "blødt (sortér)"}
                  </button>
                </div>
              </div>

              {lists.length === 0 ? (
                <p className="opacity-70">— ingen genre valgt — gå tilbage og svar på quizzen.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {lists.map(list => (
                    <div key={list.group.id} className="flex flex-col gap-2">
                      <div className="flex items-baseline gap-2 border-b border-black/20 pb-1">
                        <span className="text-2xl leading-none">{list.group.emoji}</span>
                        <h2 className="text-lg font-bold">{list.group.label}</h2>
                      </div>
                      <p className="text-xs opacity-60">
                        {list.hitcount} bøger{list.isFetching ? " (henter…)" : ""}
                        {anyHard ? " · alder/lix filtreret i søgningen" : ""}
                        {isReranked ? " · sorteret efter lix/alder" : ""}
                      </p>
                      {list.isError ? <p className="text-red-700">Fejl ved søgning i FBI.</p> : null}
                      <ul className="flex flex-col divide-y divide-black/10">
                        {list.works.map(renderBook)}
                      </ul>
                      {!list.isFetching && list.works.length === 0 ? (
                        <p className="opacity-70">
                          Ingen bøger matchede{anyHard ? " (prøv blødt filter)" : ""}.
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  className="border border-black/40 px-4 py-2"
                  onClick={() => setPhase("quiz")}>
                  ← Tilbage til quiz
                </button>
                <button type="button" className="border border-black px-4 py-2" onClick={reset}>
                  Start forfra
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {phase === "quiz" ? (
          <div className="flex items-center gap-3 border-t border-black/10 px-4 py-2 text-xs">
            <button
              type="button"
              onClick={back}
              disabled={qIndex === 0}
              aria-label="Forrige"
              className="disabled:opacity-20">
              ←
            </button>
            <div className="h-1 flex-1 bg-black/10">
              <div
                className="h-1 bg-black"
                style={{ width: `${((qIndex + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
            <span className="whitespace-nowrap opacity-60">
              Spørgsmål {qIndex + 1} af {QUESTIONS.length}
            </span>
            <button type="button" onClick={next} aria-label="Næste">
              →
            </button>
          </div>
        ) : null}
      </div>

      {/* --- Indsigt: hvad valgene betyder --- */}
      <div className="flex flex-col border border-dashed border-black/30 text-sm">
        <button
          type="button"
          onClick={() => setShowInsight(value => !value)}
          aria-expanded={showInsight}
          className="flex items-center justify-between px-3 py-2 text-left">
          <span className="text-xs font-bold tracking-wide uppercase opacity-60">
            PoC-indsigt — hvad valgene betyder
          </span>
          <span className="opacity-60">{showInsight ? "skjul ▲" : "vis ▼"}</span>
        </button>
        {showInsight ? (
          <div className="flex flex-col gap-2 border-t border-black/10 p-3">
            <div>
              <span className="font-medium">Genregrupper (2):</span>{" "}
              {genreGroups.map(group => group.label).join(", ") || "—"}
            </div>
            <div>
              <span className="font-medium">Emnegrupper:</span>{" "}
              {subjectGroups.map(group => group.label).join(", ") || "—"}
            </div>
            <div>
              <span className="font-medium">Alder:</span> {formatRanges(ageRanges, " år")} (
              {ageMode === "hard" ? "hårdt filter" : "blødt"})
            </div>
            <div>
              <span className="font-medium">Lix:</span> {formatRanges(lixRanges, "")} (
              {lixMode === "hard" ? "hårdt filter" : "blødt"})
            </div>
            <div>
              <span className="font-medium">Aktiv variant:</span>{" "}
              {variant === "genreOnly" ? "A · kun genre" : "B · genre + emner"}
            </div>
            {queries.map((query, index) => (
              <div key={query.group.id}>
                <span className="font-medium">
                  CQL liste {index + 1} — {query.group.label}:
                </span>
                <pre
                  className="mt-1 border border-black/20 bg-black/5 p-2 text-xs break-words
                    whitespace-pre-wrap">
                  {query.cql}
                </pre>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* --- Debug: redigér genre- & emnepakker (facetter) → se effekt på søgningen --- */}
      <div className="flex flex-col border border-dashed border-black/30 text-sm">
        <button
          type="button"
          onClick={() => setShowDebug(value => !value)}
          aria-expanded={showDebug}
          className="flex items-center justify-between px-3 py-2 text-left">
          <span className="text-xs font-bold tracking-wide uppercase opacity-60">
            🛠 Debug — redigér genre- &amp; emnepakker
          </span>
          <span className="opacity-60">{showDebug ? "skjul ▲" : "vis ▼"}</span>
        </button>
        {showDebug ? (
          <div className="flex flex-col gap-5 border-t border-black/10 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="opacity-60">
                Redigér hvilke FBI-facetter hver pakke indeholder (navn + termer). Ændringer slår
                live igennem på CQL og resultater. “(valgt)” = pakken bruges af dine nuværende svar.
                {GENRE_GROUPS.length} genre- · {SUBJECT_GROUPS.length} emnepakker.
              </p>
              <button
                type="button"
                onClick={resetPackages}
                className="border border-black/40 px-3 py-1">
                Nulstil pakker
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold tracking-wide uppercase opacity-60">Genrepakker</h4>
              {genrePackages.map(group => {
                const list = lists.find(current => current.group.id === group.id)
                const isSelected = genreGroups.some(current => current.id === group.id)
                return (
                  <div
                    key={group.id}
                    className="flex flex-col gap-2 border-t border-black/10 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg">{group.emoji}</span>
                      <input
                        value={group.label}
                        onChange={event => setGenreLabel(group.id, event.target.value)}
                        className="w-48 border border-black/30 px-1 py-0.5 font-medium"
                      />
                      <code className="opacity-50">{group.id}</code>
                      {isSelected ? (
                        <span className="opacity-60">
                          (valgt{list ? ` · ${list.hitcount} hits` : ""})
                        </span>
                      ) : null}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs opacity-60">A · kun genre</span>
                        <ClauseEditor
                          key={`${group.id}-A-${resetSeq}`}
                          initial={group.genreOnly}
                          onChange={clauses => setGenreSlot(group.id, "genreOnly", clauses)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs opacity-60">B · genre + emner</span>
                        <ClauseEditor
                          key={`${group.id}-B-${resetSeq}`}
                          initial={group.genrePlusSubjects}
                          onChange={clauses => setGenreSlot(group.id, "genrePlusSubjects", clauses)}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold tracking-wide uppercase opacity-60">Emnepakker</h4>
              {subjectPackages.map(group => {
                const isSelected = subjectGroups.some(current => current.id === group.id)
                return (
                  <div
                    key={group.id}
                    className="flex flex-col gap-2 border-t border-black/10 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg">{group.emoji}</span>
                      <input
                        value={group.label}
                        onChange={event => setSubjectLabel(group.id, event.target.value)}
                        className="w-48 border border-black/30 px-1 py-0.5 font-medium"
                      />
                      <code className="opacity-50">{group.id}</code>
                      {isSelected ? <span className="opacity-60">(valgt)</span> : null}
                    </div>
                    <ClauseEditor
                      key={`${group.id}-${resetSeq}`}
                      initial={group.match}
                      onChange={clauses => setSubjectMatch(group.id, clauses)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default GruppeDashboard
