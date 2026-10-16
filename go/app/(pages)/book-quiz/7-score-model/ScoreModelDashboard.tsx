"use client"

import React, { useEffect, useMemo, useState } from "react"

import {
  BookQuizComplexSearchQuery,
  useBookQuizComplexFacetsQuery,
  useBookQuizComplexSearchQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"

import { entriesByDimension, entriesFromLabels } from "../2-tilladt-liste/allowedList"
import { buildCql } from "../2-tilladt-liste/buildCql"
import { FALLBACK, PROFILES } from "../5-score/profiles"
import { QUESTIONS, TQuizOption, TQuizQuestion } from "../6-flow/quiz"
import BookQuizCover from "../_shared/BookQuizCover"

const RESULT_LIMIT = 30
const FACET_LIMIT = 100
const SHOW_LIMIT = 5
const DISABLED_SHOWN = 2

// Alle genrer/emner man kan mappe et svar til (debug-dropdown) + udgangspunkt
// for de redigerbare læse-type-scorer.
const GENRE_ENTRIES = entriesByDimension("genre")
const SUBJECT_ENTRIES = entriesByDimension("emne")
const SCORABLE_ENTRIES = [...GENRE_ENTRIES, ...SUBJECT_ENTRIES]

type TScoreMap = Record<string, Record<string, number>>

// Byg den redigerbare score-tabel ud fra tilladt-listen: alle 5 læse-typer
// pr. genre/emne (manglende = 0), så debug-modulet kan skrue på hver enkelt.
const buildInitialScoreMap = (): TScoreMap => {
  const map: TScoreMap = {}
  for (const entry of SCORABLE_ENTRIES) {
    const row: Record<string, number> = {}
    for (const current of PROFILES) row[current.key] = entry.score?.[current.key] ?? 0
    map[entry.label] = row
  }
  return map
}

type TPhase = "quiz" | "loading" | "result"
type TQuizWork = BookQuizComplexSearchQuery["complexSearch"]["works"][number]

const uniq = (values: string[]) => [...new Set(values)]

const toNumber = (value: string) => {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : null
}

// --- Bløde signaler: rerank efter nærhed til valgt lix/alder (jf. PoC 1/5) ---

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

// Hvad et svar peger på (vises som PoC-indsigt under hvert valg).
const optionMapping = (option: TQuizOption): string => {
  const parts: string[] = []
  if (option.genres?.length) parts.push(`genre: ${option.genres.join(", ")}`)
  if (option.subjects?.length) parts.push(`emne: ${option.subjects.join(", ")}`)
  if (option.materialTypes?.length) parts.push(`type: ${option.materialTypes.join(", ")}`)
  if (option.lix) parts.push(`lix ${option.lix}`)
  if (option.age) parts.push(option.age)
  if (option.note) parts.push(option.note)
  return parts.length > 0 ? parts.join(" · ") : "—"
}

// Udled de valgte genre-/emne-/materialetype-labels (plus lix/alder) fra svarene.
const deriveLabels = (questions: TQuizQuestion[], answers: Record<string, string[]>) => {
  const selected = questions.flatMap(question =>
    (answers[question.id] ?? []).flatMap(id => {
      const option = question.options.find(current => current.id === id)
      return option ? [option] : []
    })
  )
  return {
    genreLabels: uniq(selected.flatMap(option => option.genres ?? [])),
    subjectLabels: uniq(selected.flatMap(option => option.subjects ?? [])),
    materialTypeLabels: uniq(selected.flatMap(option => option.materialTypes ?? [])),
    lixPrefs: uniq(selected.flatMap(option => (option.lix ? [option.lix] : []))),
    agePrefs: uniq(selected.flatMap(option => (option.age ? [option.age] : []))),
  }
}

// To score-modeller for læsetypen:
//  A ("label"): genre/emne giver scoren (summeres over UNIKKE valgte labels).
//  B ("answer"): svaret selv giver scoren (summeres pr. valgt svar → akkumulerer
//  på tværs af spørgsmål; intet dedup). Udgangspunktet for et svar er summen af
//  dets genre/emne-scorer, men kan overrides pr. svar.
type TScoreModel = "label" | "answer"

const answerScore = (
  option: TQuizOption,
  scoreMap: TScoreMap,
  overrides: Record<string, Record<string, number>>
): Record<string, number> => {
  if (overrides[option.id]) return overrides[option.id]
  const sum: Record<string, number> = {}
  for (const label of [...(option.genres ?? []), ...(option.subjects ?? [])]) {
    for (const [key, value] of Object.entries(scoreMap[label] ?? {})) {
      sum[key] = (sum[key] ?? 0) + value
    }
  }
  return sum
}

const selectedOptionsFrom = (
  questions: TQuizQuestion[],
  answers: Record<string, string[]>
): TQuizOption[] =>
  questions.flatMap(question =>
    (answers[question.id] ?? []).flatMap(id => {
      const option = question.options.find(current => current.id === id)
      return option ? [option] : []
    })
  )

// Vis et subset af et spørgsmåls svar: de valgte + nok tilgængelige til ~5,
// plus et par deaktiverede (så korrelations-effekten er synlig). Puljen er
// større end dette, så der altid er mindst 3 valgbare tilbage.
const visibleOptions = (
  question: TQuizQuestion,
  isSelected: (option: TQuizOption) => boolean,
  isDisabled: (option: TQuizOption) => boolean
): TQuizOption[] => {
  const selected = question.options.filter(isSelected)
  const available = question.options.filter(option => !isSelected(option) && !isDisabled(option))
  const disabled = question.options.filter(option => !isSelected(option) && isDisabled(option))
  const availableShown = available.slice(0, Math.max(0, SHOW_LIMIT - selected.length))
  return [...selected, ...availableShown, ...disabled.slice(0, DISABLED_SHOWN)]
}

const ScoreModelDashboard = () => {
  const [phase, setPhase] = useState<TPhase>("quiz")
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})

  // Debug: redigerbar kopi af spørgsmålene (svar → genre/emne) og af
  // læse-type-scorerne. Bruges i stedet for de statiske konstanter, så man
  // kan skrue på hele kæden spørgsmål → genre/emne → score og se effekten.
  const [questionsState, setQuestionsState] = useState<TQuizQuestion[]>(QUESTIONS)
  const [scoreMap, setScoreMap] = useState<TScoreMap>(buildInitialScoreMap)
  const [showInsight, setShowInsight] = useState(true)
  const [showDebug, setShowDebug] = useState(false)
  const [customSeq, setCustomSeq] = useState(0)
  const [scoreModel, setScoreModel] = useState<TScoreModel>("label")
  const [answerScores, setAnswerScores] = useState<Record<string, Record<string, number>>>({})

  // Alle valgte svar på tværs af spørgsmål → de underliggende labels.
  const { genreLabels, subjectLabels, materialTypeLabels, lixPrefs, agePrefs } = deriveLabels(
    questionsState,
    answers
  )

  const genres = entriesFromLabels(genreLabels)
  const subjects = entriesFromLabels(subjectLabels)
  const materialTypes = entriesFromLabels(materialTypeLabels)

  const cql = buildCql({ genres, subjects, materialTypes })
  const hasCql = cql.length > 0

  // Læse-type-score afhænger af den valgte model (tab øverst):
  //  A: summér unikke genre/emne-labels' scorer.
  //  B: summér hvert valgt svars score (akkumulerer pr. svar).
  const selectedOptions = selectedOptionsFrom(questionsState, answers)
  const scores: Record<string, number> = {}
  if (scoreModel === "label") {
    for (const label of [...genreLabels, ...subjectLabels]) {
      for (const [key, value] of Object.entries(scoreMap[label] ?? {})) {
        scores[key] = (scores[key] ?? 0) + (value || 0)
      }
    }
  } else {
    for (const option of selectedOptions) {
      for (const [key, value] of Object.entries(answerScore(option, scoreMap, answerScores))) {
        scores[key] = (scores[key] ?? 0) + (value || 0)
      }
    }
  }
  let best: (typeof PROFILES)[number] | null = null
  for (const current of PROFILES) {
    const score = scores[current.key] ?? 0
    if (score > 0 && (!best || score > (scores[best.key] ?? 0))) best = current
  }
  const profile = best ?? FALLBACK

  // Sandsynlighed pr. læsetype: enumerér alle kombinationer af ét svar pr.
  // genre-/emne-spørgsmål og tæl hvor ofte hver læsetype vinder (samme
  // højeste-score-regel som resultatet; første vinder uafgjort). Giver et
  // billede af, om quizzen er balanceret på tværs af læsetyperne.
  const typeOdds = useMemo(() => {
    const choicesPerQuestion = questionsState
      .map(question =>
        question.options.filter(
          option => (option.genres?.length ?? 0) + (option.subjects?.length ?? 0) > 0
        )
      )
      .filter(options => options.length > 0)

    const wins: Record<string, number> = {}
    for (const current of PROFILES) wins[current.key] = 0
    let total = 0

    // Score for én kombination af valg — efter den aktive model.
    const comboScore = (chosen: TQuizOption[]): Record<string, number> => {
      const sum: Record<string, number> = {}
      if (scoreModel === "label") {
        const labels = uniq(
          chosen.flatMap(option => [...(option.genres ?? []), ...(option.subjects ?? [])])
        )
        for (const label of labels) {
          for (const [key, value] of Object.entries(scoreMap[label] ?? {})) {
            sum[key] = (sum[key] ?? 0) + value
          }
        }
      } else {
        for (const option of chosen) {
          for (const [key, value] of Object.entries(answerScore(option, scoreMap, answerScores))) {
            sum[key] = (sum[key] ?? 0) + value
          }
        }
      }
      return sum
    }

    const walk = (index: number, chosen: TQuizOption[]) => {
      if (index === choicesPerQuestion.length) {
        if (choicesPerQuestion.length === 0) return
        const sum = comboScore(chosen)
        let winner: string | null = null
        for (const current of PROFILES) {
          const score = sum[current.key] ?? 0
          if (score > 0 && (winner === null || score > (sum[winner] ?? 0))) winner = current.key
        }
        if (winner) wins[winner] += 1
        total += 1
        return
      }
      for (const option of choicesPerQuestion[index]) walk(index + 1, [...chosen, option])
    }
    walk(0, [])

    const probabilities: Record<string, number> = {}
    for (const current of PROFILES)
      probabilities[current.key] = total > 0 ? wins[current.key] / total : 0
    return { wins, total, probabilities }
  }, [questionsState, scoreMap, scoreModel, answerScores])

  // Korrelation (PoC 3): hvilke emner optræder sammen med de valgte genrer.
  const genreCql = buildCql({ genres, subjects: [], materialTypes: [] })
  const { data: facetData } = useBookQuizComplexFacetsQuery(
    {
      cql: genreCql,
      facets: { facetLimit: FACET_LIMIT, facets: ["SUBJECT"] },
      filters: {},
    },
    { enabled: phase === "quiz" && genreCql.length > 0 }
  )
  const subjectTerms = useMemo(() => {
    const terms = new Set<string>()
    for (const facet of facetData?.complexSearch.facets ?? []) {
      for (const value of facet.values ?? []) terms.add(value.key)
    }
    return terms
  }, [facetData])
  const hasSubjectFacets = subjectTerms.size > 0

  const { data, isFetching, isError } = useBookQuizComplexSearchQuery(
    { cql, offset: 0, limit: RESULT_LIMIT, filters: {} },
    { enabled: phase === "result" && hasCql }
  )
  const hitcount = data?.complexSearch.hitcount ?? 0

  const rawWorks = useMemo(() => data?.complexSearch.works ?? [], [data])
  const lixTargets = useMemo(
    () => lixPrefs.map(toNumber).filter((n): n is number => n != null),
    [lixPrefs]
  )
  const ageTargets = useMemo(
    () => agePrefs.map(toNumber).filter((n): n is number => n != null),
    [agePrefs]
  )
  const works = useMemo(
    () => rerankWorks(rawWorks, lixTargets, ageTargets),
    [rawWorks, lixTargets, ageTargets]
  )
  const isReranked = lixTargets.length > 0 || ageTargets.length > 0

  // "Vi har næsten noget" — kort overgang før resultatet.
  useEffect(() => {
    if (phase !== "loading") return
    const timer = setTimeout(() => setPhase("result"), 1200)
    return () => clearTimeout(timer)
  }, [phase])

  const question = questionsState[qIndex]
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
    if (qIndex < questionsState.length - 1) setQIndex(qIndex + 1)
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

  // Debug-handlers: ret hvilken genre/emne et svar peger på, og skru på
  // læse-type-scorerne. Begge virker live på resten af flowet.
  // Et svar må pege på flere genrer/emner. Opdater hele listen for svaret
  // (dimensionen bevares: genre-svar redigerer genres, emne-svar subjects).
  const updateOptionLabels = (questionId: string, optionId: string, labels: string[]) => {
    setQuestionsState(prev =>
      prev.map(current =>
        current.id !== questionId
          ? current
          : {
              ...current,
              options: current.options.map(option => {
                if (option.id !== optionId) return option
                if (option.genres !== undefined) return { ...option, genres: labels }
                if (option.subjects !== undefined) return { ...option, subjects: labels }
                return option
              }),
            }
      )
    )
  }
  const setScore = (label: string, profileKey: string, value: number) => {
    setScoreMap(prev => ({
      ...prev,
      [label]: { ...(prev[label] ?? {}), [profileKey]: value },
    }))
  }
  const setAnswerScore = (option: TQuizOption, profileKey: string, value: number) => {
    setAnswerScores(prev => ({
      ...prev,
      [option.id]: { ...answerScore(option, scoreMap, prev), [profileKey]: value },
    }))
  }
  const resetDebug = () => {
    setQuestionsState(QUESTIONS)
    setScoreMap(buildInitialScoreMap())
    setCustomSeq(0)
    setAnswerScores({})
  }

  // Tilføj et nyt quiz-trin (indsættes før læsetype-spørgsmålet). Svarene
  // prefyldes med de første poster i dimensionen og kan derefter remappes
  // ovenfor. Genre-trin er enkeltvalg, emne-trin er multi.
  const addStep = (dimension: "genre" | "emne") => {
    const seq = customSeq + 1
    setCustomSeq(seq)
    const pool = dimension === "genre" ? GENRE_ENTRIES : SUBJECT_ENTRIES
    const newQuestion: TQuizQuestion = {
      id: `custom-${seq}`,
      title: dimension === "genre" ? `Nyt genre-spørgsmål ${seq}` : `Nyt emne-spørgsmål ${seq}`,
      multi: dimension === "emne",
      options: pool.slice(0, 5).map((entry, index) => ({
        id: `custom-${seq}-${index}`,
        label: entry.label,
        emoji: entry.emojis?.[0],
        ...(dimension === "genre" ? { genres: [entry.label] } : { subjects: [entry.label] }),
      })),
    }
    setQuestionsState(prev => {
      const index = prev.findIndex(current => current.id === "laesetype")
      const insertAt = index === -1 ? prev.length : index
      return [...prev.slice(0, insertAt), newQuestion, ...prev.slice(insertAt)]
    })
  }
  const removeStep = (questionId: string) => {
    setQuestionsState(prev => prev.filter(current => current.id !== questionId))
    setAnswers(prev => {
      const next = { ...prev }
      delete next[questionId]
      return next
    })
    setQIndex(index => Math.max(0, index - 1))
  }

  // Korrelation: et emne, der ikke optræder sammen med de valgte genrer,
  // deaktiveres (men vises stadig).
  const subjectDisabled = (current: TQuizQuestion, option: TQuizOption) => {
    if (!option.subjects?.length) return false
    if (genreCql.length === 0 || !hasSubjectFacets) return false
    if ((answers[current.id] ?? []).includes(option.id)) return false
    return !option.subjects.some(label => {
      const entry = entriesFromLabels([label])[0]
      return entry ? entry.cqlValues.some(value => subjectTerms.has(value)) : false
    })
  }

  const isOptionSelected = (option: TQuizOption) => chosenIds.includes(option.id)
  const isOptionDisabled = (option: TQuizOption) => subjectDisabled(question, option)

  const topLabels = [...genreLabels, ...subjectLabels].slice(0, 3)
  const sortedScores = PROFILES.filter(current => (scores[current.key] ?? 0) > 0).sort(
    (a, b) => (scores[b.key] ?? 0) - (scores[a.key] ?? 0)
  )

  return (
    <section className="mx-auto my-8 flex w-full max-w-3xl flex-col gap-6 px-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Boganbefaler-quiz — PoC 7: Score-model (A/B)</h1>
        <p className="opacity-70">
          Samme flow som PoC 6, men med to måder at beregne læsetypen på — skift mellem dem i tabben
          nedenfor. <strong>Model A</strong>: genre/emne giver scoren (summeres over unikke valgte
          labels). <strong>Model B</strong>: selve svaret giver scoren, som akkumulerer pr. svar (så
          to Fantasy-agtige svar tæller dobbelt). Begge bruger samme genre/emne til at bygge CQL'en
          og finde bøgerne — kun læsetypen ændrer sig. Søgning, korrelation og debug er ens.
        </p>
      </header>

      <div className="flex border border-black/20 text-sm">
        {[
          { key: "label", label: "Model A · Genre/emne giver score" },
          { key: "answer", label: "Model B · Svaret giver score" },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setScoreModel(tab.key as TScoreModel)}
            aria-pressed={scoreModel === tab.key}
            className={[
              "flex-1 px-3 py-2",
              scoreModel === tab.key ? "bg-black text-white" : "hover:bg-black/5",
            ].join(" ")}>
            {tab.label}
          </button>
        ))}
      </div>

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
                {visibleOptions(question, isOptionSelected, isOptionDisabled).map(option => {
                  const isSelected = isOptionSelected(option)
                  const emneBlocked = subjectDisabled(question, option)
                  const disabled = emneBlocked
                  return (
                    <div key={option.id} className="flex flex-col items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => select(question, option.id)}
                        aria-pressed={isSelected}
                        disabled={disabled}
                        className={[
                          "rounded-full border px-5 py-2 text-sm",
                          isSelected
                            ? "border-black bg-black/10"
                            : "border-black/30 hover:bg-black/5",
                          disabled ? "cursor-not-allowed opacity-30 hover:bg-transparent" : "",
                        ].join(" ")}>
                        {option.emoji ? <span className="mr-1">{option.emoji}</span> : null}
                        {option.label}
                      </button>
                      <span className="text-[10px] opacity-50">
                        → {optionMapping(option)}
                        {emneBlocked ? " · findes ikke sammen med dine genrer" : ""}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          {phase === "loading" ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="text-3xl">🗺️ 🦇 💭 🔭 🤣</div>
              <p className="text-xs font-bold tracking-widest uppercase opacity-60">
                Finder dit næste eventyr
              </p>
              <h2 className="text-2xl font-bold">Vi har næsten noget.</h2>
              <p className="opacity-60">Bare lige ét sidste helt uvidenskabeligt tjek.</p>
            </div>
          ) : null}

          {phase === "result" ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 border border-black/20 p-4">
                <span className="text-5xl leading-none">{profile.emoji}</span>
                <div>
                  <p className="text-xs opacity-60">Du er</p>
                  <h2 className="text-lg font-bold">{profile.heading}</h2>
                  <p className="opacity-70">{profile.text}</p>
                </div>
              </div>

              <div>
                <p className="opacity-60">Du kan godt lide</p>
                <h2 className="text-xl font-bold uppercase">
                  {topLabels.length > 0 ? topLabels.join(" & ") : "bøger"}
                </h2>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {[...genres, ...subjects].map(entry => (
                    <li key={entry.label}>✅ {entry.label}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold">
                  {hasCql ? `${hitcount} bøger` : "— ingen genre/emne valgt —"}
                  {isFetching ? " (henter…)" : ""}
                  {isReranked ? " · sorteret efter lix/alder" : ""}
                </h3>
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
                            <span className="font-medium">
                              {work.titles.full[0] ?? "Uden titel"}
                            </span>
                            {work.creators.length > 0 ? (
                              <span className="opacity-70">
                                {" "}
                                · {displayCreators(work.creators, 2)}
                              </span>
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
                  <p className="opacity-70">Ingen bøger matchede — prøv at ændre dine svar.</p>
                ) : null}
              </div>

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
                style={{ width: `${((qIndex + 1) / questionsState.length) * 100}%` }}
              />
            </div>
            <span className="whitespace-nowrap opacity-60">
              Spørgsmål {qIndex + 1} af {questionsState.length}
            </span>
            <button type="button" onClick={next} aria-label="Næste">
              →
            </button>
          </div>
        ) : null}
      </div>

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
              <span className="font-medium">Score-model:</span>{" "}
              {scoreModel === "label"
                ? "A · genre/emne giver scoren"
                : "B · svaret giver scoren (akkumulerer pr. svar)"}
            </div>
            <div>
              <span className="font-medium">Genrer:</span> {genreLabels.join(", ") || "—"}
            </div>
            <div>
              <span className="font-medium">Emner:</span> {subjectLabels.join(", ") || "—"}
            </div>
            {materialTypeLabels.length > 0 ? (
              <div>
                <span className="font-medium">Materialetype:</span> {materialTypeLabels.join(", ")}
              </div>
            ) : null}
            {lixPrefs.length > 0 || agePrefs.length > 0 ? (
              <div>
                <span className="font-medium">Bløde signaler:</span>{" "}
                {[...lixPrefs.map(value => `lix ${value}`), ...agePrefs].join(", ")}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="font-medium">Læse-type-score:</span>
              {sortedScores.length > 0 ? (
                sortedScores.map(current => (
                  <span
                    key={current.key}
                    className={current.key === profile.key ? "font-bold" : ""}>
                    {current.emoji} {current.heading}: {scores[current.key]}
                  </span>
                ))
              ) : (
                <span className="opacity-50">—</span>
              )}
            </div>
            <div>
              <span className="font-medium">CQL:</span>
              <pre
                className="mt-1 border border-black/20 bg-black/5 p-2 text-xs break-words
                  whitespace-pre-wrap">
                {hasCql ? cql : "— endnu ingen genre/emne valgt —"}
              </pre>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col border border-dashed border-black/30 text-sm">
        <button
          type="button"
          onClick={() => setShowDebug(value => !value)}
          aria-expanded={showDebug}
          className="flex items-center justify-between px-3 py-2 text-left">
          <span className="text-xs font-bold tracking-wide uppercase opacity-60">
            🛠 Debug — rediger spørgsmål → genre/emne → læse-type-score
          </span>
          <span className="opacity-60">{showDebug ? "skjul ▲" : "vis ▼"}</span>
        </button>
        {showDebug ? (
          <div className="flex flex-col gap-5 border-t border-black/10 p-3">
            <p className="opacity-60">
              Alt her virker live på resten af flowet, men ændrer ikke koden. Brug “Nulstil debug”
              for at gå tilbage til udgangspunktet.
            </p>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold tracking-wide uppercase opacity-60">
                1 · Svar → genre/emne
              </h4>
              {questionsState.map(current => (
                <div key={current.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{current.title}</span>
                    {current.id.startsWith("custom-") ? (
                      <button
                        type="button"
                        onClick={() => removeStep(current.id)}
                        className="border border-black/30 px-1.5 py-0.5 text-xs opacity-70
                          hover:opacity-100">
                        ✕ fjern trin
                      </button>
                    ) : null}
                  </div>
                  {current.options.map(option => {
                    const dim =
                      option.genres !== undefined
                        ? "genre"
                        : option.subjects !== undefined
                          ? "emne"
                          : null
                    const selectedLabels = option.genres ?? option.subjects ?? []
                    const pool = dim === "genre" ? GENRE_ENTRIES : SUBJECT_ENTRIES
                    const available = pool.filter(entry => !selectedLabels.includes(entry.label))
                    return (
                      <div key={option.id} className="flex flex-wrap items-center gap-2">
                        <span className="w-56 shrink-0 truncate opacity-80">
                          {option.emoji ? `${option.emoji} ` : ""}
                          {option.label}
                        </span>
                        {dim === null ? (
                          <span className="opacity-50">blødt signal · {optionMapping(option)}</span>
                        ) : (
                          <>
                            {selectedLabels.map(label => (
                              <span
                                key={label}
                                className="flex items-center gap-1 border border-black/30 px-2
                                  py-0.5">
                                {dim}: {label}
                                <button
                                  type="button"
                                  aria-label={`Fjern ${label}`}
                                  onClick={() =>
                                    updateOptionLabels(
                                      current.id,
                                      option.id,
                                      selectedLabels.filter(value => value !== label)
                                    )
                                  }
                                  className="opacity-60 hover:opacity-100">
                                  ✕
                                </button>
                              </span>
                            ))}
                            {available.length > 0 ? (
                              <select
                                className="border border-black/30 px-1 py-0.5"
                                value=""
                                onChange={event => {
                                  if (!event.target.value) return
                                  updateOptionLabels(current.id, option.id, [
                                    ...selectedLabels,
                                    event.target.value,
                                  ])
                                }}>
                                <option value="">+ tilføj {dim}…</option>
                                {available.map(entry => (
                                  <option key={entry.label} value={entry.label}>
                                    {entry.label}
                                  </option>
                                ))}
                              </select>
                            ) : null}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2 border-t border-black/10 pt-2">
                <span className="opacity-60">
                  Tilføj et trin før “Hvad passer bedst på dig som læser?”:
                </span>
                <button
                  type="button"
                  onClick={() => addStep("genre")}
                  className="border border-black/40 px-2 py-0.5">
                  + genre-trin
                </button>
                <button
                  type="button"
                  onClick={() => addStep("emne")}
                  className="border border-black/40 px-2 py-0.5">
                  + emne-trin
                </button>
              </div>
            </div>

            {scoreModel === "label" ? (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold tracking-wide uppercase opacity-60">
                  2 · Genre/emne → læse-type-score (model A)
                </h4>
                {[
                  { heading: "Genrer", labels: GENRE_ENTRIES.map(entry => entry.label) },
                  { heading: "Emner", labels: SUBJECT_ENTRIES.map(entry => entry.label) },
                ].map(group => (
                  <div key={group.heading} className="flex flex-col gap-1">
                    <h5 className="font-medium">{group.heading}</h5>
                    <div className="overflow-x-auto">
                      <table className="border-collapse text-xs">
                        <thead>
                          <tr>
                            <th className="px-2 py-1 text-left font-medium">{group.heading}</th>
                            {PROFILES.map(current => (
                              <th key={current.key} className="px-1 py-1 text-center font-medium">
                                {current.emoji}
                                <div className="font-normal opacity-60">{current.heading}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {group.labels.length === 0 ? (
                            <tr>
                              <td className="px-2 py-1 opacity-50" colSpan={PROFILES.length + 1}>
                                — ingen —
                              </td>
                            </tr>
                          ) : (
                            group.labels.map(label => (
                              <tr key={label} className="border-t border-black/10">
                                <td className="px-2 py-1 whitespace-nowrap">{label}</td>
                                {PROFILES.map(current => (
                                  <td key={current.key} className="px-1 py-1 text-center">
                                    <input
                                      type="number"
                                      min={0}
                                      max={10}
                                      value={scoreMap[label]?.[current.key] ?? 0}
                                      onChange={event =>
                                        setScore(
                                          label,
                                          current.key,
                                          Number(event.target.value) || 0
                                        )
                                      }
                                      className="w-12 border border-black/30 px-1 py-0.5
                                        text-center"
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold tracking-wide uppercase opacity-60">
                  2 · Svar → læse-type-score (model B)
                </h4>
                <p className="opacity-60">
                  Udgangspunkt = summen af svarets genre/emne-scorer. Her kan du override pr. svar.
                </p>
                {questionsState.map(current => {
                  const scoringOptions = current.options.filter(
                    option => (option.genres?.length ?? 0) + (option.subjects?.length ?? 0) > 0
                  )
                  if (scoringOptions.length === 0) return null
                  return (
                    <div key={current.id} className="flex flex-col gap-1">
                      <h5 className="font-medium">{current.title}</h5>
                      <div className="overflow-x-auto">
                        <table className="border-collapse text-xs">
                          <thead>
                            <tr>
                              <th className="px-2 py-1 text-left font-medium">Svar</th>
                              {PROFILES.map(profile => (
                                <th key={profile.key} className="px-1 py-1 text-center font-medium">
                                  {profile.emoji}
                                  <div className="font-normal opacity-60">{profile.heading}</div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {scoringOptions.map(option => {
                              const vector = answerScore(option, scoreMap, answerScores)
                              return (
                                <tr key={option.id} className="border-t border-black/10">
                                  <td className="px-2 py-1">
                                    {option.emoji ? `${option.emoji} ` : ""}
                                    {option.label}
                                  </td>
                                  {PROFILES.map(profile => (
                                    <td key={profile.key} className="px-1 py-1 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={vector[profile.key] ?? 0}
                                        onChange={event =>
                                          setAnswerScore(
                                            option,
                                            profile.key,
                                            Number(event.target.value) || 0
                                          )
                                        }
                                        className="w-12 border border-black/30 px-1 py-0.5
                                          text-center"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold tracking-wide uppercase opacity-60">
                3 · Sandsynlighed pr. læsetype
              </h4>
              <p className="opacity-60">
                Hvis man vælger ét tilfældigt svar i hvert genre-/emne-spørgsmål (
                {typeOdds.total.toLocaleString("da-DK")} kombinationer), hvor ofte ender hver
                læsetype så som resultat. Læsetype-spørgsmålet påvirker ikke beregningen.
              </p>
              <ul className="flex flex-col gap-1">
                {PROFILES.map(current => {
                  const probability = typeOdds.probabilities[current.key] ?? 0
                  return (
                    <li key={current.key} className="flex items-center gap-2">
                      <span className="w-40 shrink-0">
                        {current.emoji} {current.heading}
                      </span>
                      <span className="h-2 flex-1 bg-black/10">
                        <span
                          className="block h-2 bg-black"
                          style={{ width: `${(probability * 100).toFixed(1)}%` }}
                        />
                      </span>
                      <span className="w-14 text-right tabular-nums">
                        {(probability * 100).toFixed(1)}%
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div>
              <button
                type="button"
                onClick={resetDebug}
                className="border border-black/40 px-3 py-1">
                Nulstil debug
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default ScoreModelDashboard
