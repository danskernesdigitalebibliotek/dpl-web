"use client"

import React, { useEffect, useMemo, useState } from "react"

import {
  BookQuizComplexSearchQuery,
  useBookQuizComplexFacetsQuery,
  useBookQuizComplexSearchQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"

import { entriesByDimension, entriesFromLabels, entryClause } from "../2-tilladt-liste/allowedList"
import { buildCql } from "../2-tilladt-liste/buildCql"
import { FALLBACK, PROFILES } from "../5-score/profiles"
import { TQuizOption, TQuizQuestion, TRange } from "../6-flow/quiz"
import { withHardAudienceFilters } from "../_shared/audienceCql"
import BookQuizCover from "../_shared/BookQuizCover"
import { QUIZ_QUESTIONS } from "./questions"

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

const formatRanges = (ranges: TRange[], unit: string) =>
  ranges.length > 0 ? ranges.map(([lo, hi]) => `${lo}–${hi}${unit}`).join(", ") : "—"

// --- Alder & lix som INTERVALLER. Blødt = rerank efter afstand til nærmeste
// valgte interval; hårdt = filtrér værker udenfor helt væk. ---

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

// Afstand fra et lix-tal til nærmeste valgte interval (0 = indeni).
const lixDistance = (value: number, ranges: TRange[]) =>
  Math.min(...ranges.map(([lo, hi]) => (value < lo ? lo - value : value > hi ? value - hi : 0)))

// Afstand mellem værkets alders-interval og nærmeste valgte interval (0 = overlap).
const ageDistance = (ages: { low: number; high: number }, ranges: TRange[]) =>
  Math.min(...ranges.map(([lo, hi]) => Math.max(0, Math.max(ages.low, lo) - Math.min(ages.high, hi))))

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

const formatAges = (work: TQuizWork): string | null => {
  const ages = getWorkAges(work)
  if (!ages) return null
  if (ages.low === ages.high) return `${ages.low} år`
  return `${ages.low}–${ages.high} år`
}

// Hård alder/lix-filtrering sker nu i CQL'en (se ../_shared/audienceCql), ikke
// client-side — så hitcount/0-hits er ægte.

// Hvad et svar peger på (vises som PoC-indsigt under hvert valg).
const optionMapping = (option: TQuizOption): string => {
  const parts: string[] = []
  if (option.genres?.length) parts.push(`genre: ${option.genres.join(", ")}`)
  if (option.subjects?.length) parts.push(`emne: ${option.subjects.join(", ")}`)
  if (option.materialTypes?.length) parts.push(`type: ${option.materialTypes.join(", ")}`)
  if (option.lixRange) parts.push(`lix ${option.lixRange[0]}–${option.lixRange[1]}`)
  if (option.ageRange) parts.push(`alder ${option.ageRange[0]}–${option.ageRange[1]} år`)
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
    lixRanges: selected.flatMap(option => (option.lixRange ? [option.lixRange] : [])),
    ageRanges: selected.flatMap(option => (option.ageRange ? [option.ageRange] : [])),
  }
}

// To score-modeller for læsetypen:
//  A ("label"): genre/emne giver scoren (summeres over UNIKKE valgte labels).
//  B ("answer"): SVARET giver scoren direkte (summeres pr. valgt svar; akkumulerer
//  på tværs af spørgsmål). UAFHÆNGIG af genre/emne — allow-listens score påvirker
//  IKKE læsetypen i model B. Udgangspunktet seedes dog én gang fra allow-listen,
//  og kan derefter redigeres frit pr. svar.
type TScoreModel = "label" | "answer"

// Seed-score for et svar (engangs-udgangspunkt fra allow-listens scorer).
const answerScoreSeed = (option: TQuizOption): Record<string, number> => {
  const sum: Record<string, number> = {}
  for (const label of [...(option.genres ?? []), ...(option.subjects ?? [])]) {
    const entry = entriesFromLabels([label])[0]
    for (const current of PROFILES) {
      sum[current.key] = (sum[current.key] ?? 0) + (entry?.score?.[current.key] ?? 0)
    }
  }
  return sum
}

const buildInitialAnswerScores = (
  questions: TQuizQuestion[]
): Record<string, Record<string, number>> => {
  const map: Record<string, Record<string, number>> = {}
  for (const question of questions) {
    for (const option of question.options) {
      if ((option.genres?.length ?? 0) + (option.subjects?.length ?? 0) === 0) continue
      map[option.id] = answerScoreSeed(option)
    }
  }
  return map
}

// Model B-score for et svar: udelukkende svarets egen (seedede/redigerede) score.
const answerScore = (
  option: TQuizOption,
  store: Record<string, Record<string, number>>
): Record<string, number> => store[option.id] ?? {}

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

// --- Test-profiler (kvalitetstjek): faste "børne-profiler" = komplette SVAR på
// alle quiz-spørgsmål (spørgsmåls-id → valgte svar-id'er). Hver køres gennem
// samme deriveLabels + buildCql + rerank som quizzen, så profilen er realistisk
// og kun bruger genrer/emner der faktisk kan nås via spørgsmålene. Viser
// top-bøger side om side, så man kan eyeballe kvaliteten (og fange forringelser
// når allow-listen/scorerne ændres).
type TTestProfile = {
  name: string
  answers: Record<string, string[]>
}

const TEST_PROFILES: TTestProfile[] = [
  // alder · lix · superkraft (genre) · sted (genre) · hjerte (emne) · tanker (emne)
  {
    name: "Lille eventyrer",
    answers: {
      alder: ["alder-8"],
      lix: ["lix-let"],
      superkraft: ["sk-eventyr"],
      sted: ["st-skov"],
      hjerte: ["hj-magi", "hj-dyr"],
      tanker: ["ta-dyr"],
    },
  },
  {
    name: "Spændingsjæger",
    answers: {
      alder: ["alder-10"],
      lix: ["lix-mellem"],
      superkraft: ["sk-hurtig"],
      sted: ["st-gerning"],
      hjerte: ["hj-gaming"],
      tanker: ["ta-venner"],
    },
  },
  {
    name: "Gyser-fan",
    answers: {
      alder: ["alder-12"],
      lix: ["lix-mellem"],
      superkraft: ["sk-spoegelser"],
      sted: ["st-hus"],
      hjerte: ["hj-uhygge"],
      tanker: ["ta-foelelser"],
    },
  },
  {
    name: "Grineren",
    answers: {
      alder: ["alder-8"],
      lix: ["lix-let"],
      superkraft: ["sk-grine"],
      sted: ["st-tegne"],
      hjerte: ["hj-venner"],
      tanker: ["ta-skolen"],
    },
  },
  {
    name: "Drømmeren",
    answers: {
      alder: ["alder-12"],
      lix: ["lix-svaer"],
      superkraft: ["sk-rejse"],
      sted: ["st-slot"],
      hjerte: ["hj-venner"],
      tanker: ["ta-kaerlighed"],
    },
  },
  {
    name: "Rum-opdager",
    answers: {
      alder: ["alder-12"],
      lix: ["lix-mellem"],
      superkraft: ["sk-rum"],
      sted: ["st-planet"],
      hjerte: ["hj-gaming"],
      tanker: ["ta-historie"],
    },
  },
  {
    name: "Dyreven",
    answers: {
      alder: ["alder-6"],
      lix: ["lix-let"],
      superkraft: ["sk-eventyr"],
      sted: ["st-skov"],
      hjerte: ["hj-dyr", "hj-natur"],
      tanker: ["ta-dyr"],
    },
  },
  {
    name: "Sportsfan",
    answers: {
      alder: ["alder-10"],
      lix: ["lix-mellem"],
      superkraft: ["sk-hurtig"],
      sted: ["st-jagt"],
      hjerte: ["hj-sport"],
      tanker: ["ta-venner"],
    },
  },
  {
    name: "Krimi-nørd",
    answers: {
      alder: ["alder-12"],
      lix: ["lix-svaer"],
      superkraft: ["sk-lyv"],
      sted: ["st-gerning"],
      hjerte: ["hj-uhygge"],
      tanker: ["ta-foelelser"],
    },
  },
  {
    name: "Historie-fan",
    answers: {
      alder: ["alder-12"],
      lix: ["lix-mellem"],
      superkraft: ["sk-eventyr"],
      sted: ["st-slot"],
      hjerte: ["hj-historie"],
      tanker: ["ta-historie"],
    },
  },
  {
    name: "Familie-læser",
    answers: {
      alder: ["alder-8"],
      lix: ["lix-let"],
      superkraft: ["sk-grine"],
      sted: ["st-skaev"],
      hjerte: ["hj-venner"],
      tanker: ["ta-familie"],
    },
  },
  {
    name: "Magi-elsker",
    answers: {
      alder: ["alder-10"],
      lix: ["lix-mellem"],
      superkraft: ["sk-rejse"],
      sted: ["st-skov"],
      hjerte: ["hj-magi"],
      tanker: ["ta-magi"],
    },
  },
  {
    name: "Følsom læser",
    answers: {
      alder: ["alder-14"],
      lix: ["lix-svaer"],
      superkraft: ["sk-rejse"],
      sted: ["st-slot"],
      hjerte: ["hj-venner"],
      tanker: ["ta-foelelser"],
    },
  },
]

const TEST_TOP_N = 6

// De konkrete quiz-valg en profil bygger på (spørgsmål → valgte svar-labels).
const profileAnswerLabels = (answers: Record<string, string[]>) =>
  QUIZ_QUESTIONS.flatMap(question => {
    const labels = (answers[question.id] ?? [])
      .map(id => question.options.find(option => option.id === id)?.label)
      .filter((label): label is string => Boolean(label))
    return labels.length > 0 ? [{ id: question.id, title: question.title, labels }] : []
  })

const ProfileColumn = ({
  profile,
  ageMode,
  lixMode,
  scoreModel,
}: {
  profile: TTestProfile
  ageMode: "soft" | "hard"
  lixMode: "soft" | "hard"
  scoreModel: TScoreModel
}) => {
  // Udled labels fra profilens svar — præcis som quizzen gør.
  const derived = useMemo(() => deriveLabels(QUIZ_QUESTIONS, profile.answers), [profile])
  // Læsetype for den valgte model (base-scorer fra allow-listen): model A =
  // sum over unikke genre/emne-labels, model B = sum pr. valgt svar.
  const persona = useMemo(() => {
    const scoreSum: Record<string, number> = {}
    if (scoreModel === "label") {
      for (const label of [...derived.genreLabels, ...derived.subjectLabels]) {
        const entry = entriesFromLabels([label])[0]
        for (const [key, value] of Object.entries(entry?.score ?? {})) {
          scoreSum[key] = (scoreSum[key] ?? 0) + value
        }
      }
    } else {
      for (const option of selectedOptionsFrom(QUIZ_QUESTIONS, profile.answers)) {
        for (const [key, value] of Object.entries(answerScoreSeed(option))) {
          scoreSum[key] = (scoreSum[key] ?? 0) + value
        }
      }
    }
    let best: (typeof PROFILES)[number] | null = null
    for (const current of PROFILES) {
      const score = scoreSum[current.key] ?? 0
      if (score > 0 && (!best || score > (scoreSum[best.key] ?? 0))) best = current
    }
    return best ?? FALLBACK
  }, [derived, profile, scoreModel])
  const cql = useMemo(
    () =>
      buildCql({
        genres: entriesFromLabels(derived.genreLabels),
        subjects: entriesFromLabels(derived.subjectLabels),
        materialTypes: [],
      }),
    [derived]
  )
  const ageRanges = derived.ageRanges
  const lixRanges = derived.lixRanges
  // Hårde alder/lix-filtre AND'es ind i CQL'en; bløde rerankes client-side.
  const effectiveCql = useMemo(
    () => withHardAudienceFilters(cql, { ageRanges, lixRanges, ageMode, lixMode }),
    [cql, ageRanges, lixRanges, ageMode, lixMode]
  )
  const { data, isFetching, isError } = useBookQuizComplexSearchQuery(
    { cql: effectiveCql, offset: 0, limit: 20, filters: {} },
    { enabled: cql.length > 0 }
  )
  const hitcount = data?.complexSearch.hitcount ?? 0
  const rawWorks = useMemo(() => data?.complexSearch.works ?? [], [data])
  const works = useMemo(() => {
    const softLix = lixMode === "soft" ? lixRanges : []
    const softAge = ageMode === "soft" ? ageRanges : []
    return rerankWorks(rawWorks, softLix, softAge).slice(0, TEST_TOP_N)
  }, [rawWorks, lixRanges, ageRanges, ageMode, lixMode])
  return (
    <div className="flex w-64 shrink-0 flex-col gap-2 border border-black/20 p-3 text-xs">
      <h3 className="text-sm font-bold">{profile.name}</h3>
      <div className="border border-black/15 px-2 py-1">
        <span className="opacity-60">Læsetype ({scoreModel === "label" ? "A" : "B"}):</span>{" "}
        <span className="font-medium">
          {persona.emoji} {persona.heading}
        </span>
      </div>
      <div className="opacity-60">
        <div>Genrer: {derived.genreLabels.join(", ") || "—"}</div>
        <div>Emner: {derived.subjectLabels.join(", ") || "—"}</div>
        <div>
          Alder: {formatRanges(ageRanges, " år")} · lix: {formatRanges(lixRanges, "")}
        </div>
      </div>
      <details className="opacity-70">
        <summary className="cursor-pointer select-none">Quiz-valg</summary>
        <ul className="mt-1 flex flex-col gap-0.5">
          {profileAnswerLabels(profile.answers).map(item => (
            <li key={item.id}>
              <span className="opacity-60">{item.title}</span> → {item.labels.join(", ")}
            </li>
          ))}
        </ul>
      </details>
      <div className="font-bold">
        {cql.length === 0 ? "—" : `${hitcount} hits`}
        {isFetching ? " (henter…)" : ""}
      </div>
      {isError ? <p className="text-red-700">Fejl i FBI.</p> : null}
      <ul className="flex flex-col divide-y divide-black/10">
        {works.map(work => {
          const workLix = getWorkLix(work)
          const workAges = formatAges(work)
          return (
            <li key={work.workId} className="flex items-start gap-2 py-2">
              <BookQuizCover work={work} />
              <div className="flex min-w-0 flex-col">
                <span className="font-medium">{work.titles.full[0] ?? "Uden titel"}</span>
                {work.creators.length > 0 ? (
                  <span className="opacity-70">{displayCreators(work.creators, 1)}</span>
                ) : null}
                <span className="opacity-50">
                  {workLix != null ? `lix ${workLix}` : "lix —"}
                  {workAges ? ` · ${workAges}` : " · alder —"}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
      {cql.length > 0 && !isFetching && works.length === 0 ? (
        <p className="opacity-70">Ingen bøger.</p>
      ) : null}
    </div>
  )
}

const ScoreModelDashboard = () => {
  const [phase, setPhase] = useState<TPhase>("quiz")
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})

  // Debug: redigerbar kopi af spørgsmålene (svar → genre/emne) og af
  // læse-type-scorerne. Bruges i stedet for de statiske konstanter, så man
  // kan skrue på hele kæden spørgsmål → genre/emne → score og se effekten.
  const [questionsState, setQuestionsState] = useState<TQuizQuestion[]>(QUIZ_QUESTIONS)
  const [scoreMap, setScoreMap] = useState<TScoreMap>(buildInitialScoreMap)
  const [showInsight, setShowInsight] = useState(true)
  const [showDebug, setShowDebug] = useState(false)
  const [customSeq, setCustomSeq] = useState(0)
  const [view, setView] = useState<"quiz" | "test">("quiz")
  const [testAgeMode, setTestAgeMode] = useState<"soft" | "hard">("soft")
  const [testLixMode, setTestLixMode] = useState<"soft" | "hard">("soft")
  const [ageMode, setAgeMode] = useState<"soft" | "hard">("soft")
  const [lixMode, setLixMode] = useState<"soft" | "hard">("soft")
  const [scoreModel, setScoreModel] = useState<TScoreModel>("label")
  const [answerScores, setAnswerScores] = useState<Record<string, Record<string, number>>>(() =>
    buildInitialAnswerScores(QUIZ_QUESTIONS)
  )

  // Alle valgte svar på tværs af spørgsmål → de underliggende labels.
  const { genreLabels, subjectLabels, materialTypeLabels, lixRanges, ageRanges } = deriveLabels(
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
      for (const [key, value] of Object.entries(answerScore(option, answerScores))) {
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
          for (const [key, value] of Object.entries(answerScore(option, answerScores))) {
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

  // Alder og lix kommer fra læsepræference-trinnene i quizzen (begge multi-valg).
  // Blødt = rerank client-side; HÅRDT = AND'es ind i selve CQL-søgningen.
  const effectiveCql = useMemo(
    () => withHardAudienceFilters(cql, { ageRanges, lixRanges, ageMode, lixMode }),
    [cql, ageRanges, lixRanges, ageMode, lixMode]
  )
  const { data, isFetching, isError } = useBookQuizComplexSearchQuery(
    { cql: effectiveCql, offset: 0, limit: RESULT_LIMIT, filters: {} },
    { enabled: phase === "result" && hasCql }
  )
  const hitcount = data?.complexSearch.hitcount ?? 0

  const rawWorks = useMemo(() => data?.complexSearch.works ?? [], [data])
  const softAgeRanges = ageMode === "soft" ? ageRanges : []
  const softLixRanges = lixMode === "soft" ? lixRanges : []
  const displayWorks = useMemo(
    () => rerankWorks(rawWorks, softLixRanges, softAgeRanges),
    [rawWorks, softLixRanges, softAgeRanges]
  )
  const ageFiltered = ageMode === "hard" && ageRanges.length > 0
  const lixFiltered = lixMode === "hard" && lixRanges.length > 0
  const anyHard = ageFiltered || lixFiltered
  const isReranked = softLixRanges.length > 0 || softAgeRanges.length > 0

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
      [option.id]: { ...(prev[option.id] ?? answerScoreSeed(option)), [profileKey]: value },
    }))
  }
  const resetDebug = () => {
    setQuestionsState(QUIZ_QUESTIONS)
    setScoreMap(buildInitialScoreMap())
    setCustomSeq(0)
    setAnswerScores(buildInitialAnswerScores(QUIZ_QUESTIONS))
    setAgeMode("soft")
    setLixMode("soft")
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
    setQuestionsState(prev => [...prev, newQuestion])
    setAnswerScores(prev => ({ ...prev, ...buildInitialAnswerScores([newQuestion]) }))
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

  // Aldersgate: når alder(e) er valgt (læsepræference-trinnet), deaktiveres
  // genre/emne-valg der ikke er alderssvarende for NOGEN af de valgte aldre
  // (fx Gys/Krimi for de yngste).
  const ageAppropriate = (option: TQuizOption, range: TRange) => {
    const labels = [...(option.genres ?? []), ...(option.subjects ?? [])]
    return labels.every(label => {
      const entry = entriesFromLabels([label])[0]
      if (!entry) return true
      // Alderssvarende hvis det valgte interval overlapper postens tilladte bånd.
      if (entry.minAge != null && range[1] < entry.minAge) return false
      if (entry.maxAge != null && range[0] > entry.maxAge) return false
      return true
    })
  }
  const ageGate = (option: TQuizOption) =>
    ageRanges.length > 0 && !ageRanges.some(range => ageAppropriate(option, range))

  const isOptionSelected = (option: TQuizOption) => chosenIds.includes(option.id)
  const isOptionDisabled = (option: TQuizOption) =>
    subjectDisabled(question, option) || ageGate(option)

  const topLabels = [...genreLabels, ...subjectLabels].slice(0, 3)
  const sortedScores = PROFILES.filter(current => (scores[current.key] ?? 0) > 0).sort(
    (a, b) => (scores[b.key] ?? 0) - (scores[a.key] ?? 0)
  )

  // Allow-listen (alle genrer + emner → læse-type-score). Bruges i model A som
  // selve scoren, og i model B som udgangspunkt for per-svar-scoren — derfor
  // vises den i begge modeller.
  const allowListScoreTables = (
    <>
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
                {group.labels.map(label => (
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
                            setScore(label, current.key, Number(event.target.value) || 0)
                          }
                          className="w-12 border border-black/30 px-1 py-0.5 text-center"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  )

  return (
    <section className="mx-auto my-8 flex w-full max-w-3xl flex-col gap-6 px-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Boganbefaler-quiz — PoC 7: Score-model (A/B)</h1>
        <p className="opacity-70">
          Bygger på PoC 6. Flowet starter med <strong>læsepræferencer</strong> (alder, så lix),
          fordi alderen gater hvilke genrer/emner der kan vælges bagefter (ikke-alderssvarende valg
          vises deaktiveret). Derefter to måder at beregne læsetypen på — skift i tabben nedenfor.{" "}
          <strong>Model A</strong>: genre/emne giver scoren (unikke labels).{" "}
          <strong>Model B</strong>: selve svaret giver scoren, som akkumulerer pr. svar. Begge
          bruger samme genre/emne til at bygge CQL'en — kun læsetypen ændrer sig.
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

      <div className="flex border-b border-black/20 text-sm font-medium">
        {[
          { key: "quiz", label: "Quiz" },
          { key: "test", label: "Test-profiler" },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setView(tab.key as "quiz" | "test")}
            aria-pressed={view === tab.key}
            className={[
              "px-4 py-2",
              view === tab.key ? "border-b-2 border-black" : "opacity-50 hover:opacity-100",
            ].join(" ")}>
            {tab.label}
          </button>
        ))}
      </div>

      {view === "test" ? (
        <div className="flex flex-col gap-3">
          <p className="opacity-70">
            Faste børne-profiler (komplette quiz-svar) kørt gennem samme CQL + rerank. Hver viser
            sin læsetype for den valgte model (A/B-tabben øverst) + top {TEST_TOP_N} bøger — til at
            eyeballe kvaliteten og sammenligne de to modeller.
          </p>
          {[
            { label: "Alder", mode: testAgeMode, set: setTestAgeMode },
            { label: "Lix", mode: testLixMode, set: setTestLixMode },
          ].map(row => (
            <div key={row.label} className="flex flex-wrap items-center gap-3 text-sm">
              <span className="w-12 font-medium">{row.label}:</span>
              <div className="flex items-center gap-1">
                {[
                  { key: "soft", label: "Blødt (sortér)" },
                  { key: "hard", label: "Hårdt (filtrér)" },
                ].map(option => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => row.set(option.key as "soft" | "hard")}
                    aria-pressed={row.mode === option.key}
                    className={[
                      "border px-2 py-0.5",
                      row.mode === option.key ? "border-black bg-black/10" : "border-black/30",
                    ].join(" ")}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {TEST_PROFILES.map(profile => (
              <ProfileColumn
                key={profile.name}
                profile={profile}
                ageMode={testAgeMode}
                lixMode={testLixMode}
                scoreModel={scoreModel}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div hidden={view !== "quiz"} className="flex flex-col gap-6">
        <div className="flex flex-col border border-black/20">
          <div
            className="flex items-center justify-between border-b border-black/10 bg-black/[0.02]
              px-4 py-2 text-sm">
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
                    const ageBlocked = ageGate(option)
                    const disabled = emneBlocked || ageBlocked
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
                          {ageBlocked ? " · ikke for din alder" : ""}
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
                    {anyHard ? " · alder/lix filtreret i søgningen" : ""}
                    {isReranked ? " · sorteret efter lix/alder" : ""}
                  </h3>
                  {isError ? <p className="text-red-700">Fejl ved søgning i FBI.</p> : null}
                  <ul className="flex flex-col divide-y divide-black/10">
                    {displayWorks.map(work => {
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
                  {hasCql && !isFetching && displayWorks.length === 0 ? (
                    <p className="opacity-70">
                      {anyHard
                        ? "Ingen bøger matchede dit alders-/lix-filter — prøv blødt filter eller andre svar."
                        : "Ingen bøger matchede — prøv at ændre dine svar."}
                    </p>
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
                  <span className="font-medium">Materialetype:</span>{" "}
                  {materialTypeLabels.join(", ")}
                </div>
              ) : null}
              {lixRanges.length > 0 || ageRanges.length > 0 ? (
                <div>
                  <span className="font-medium">Alder &amp; lix:</span>{" "}
                  {[
                    ageRanges.length > 0 ? `alder ${formatRanges(ageRanges, " år")}` : null,
                    lixRanges.length > 0 ? `lix ${formatRanges(lixRanges, "")}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
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
                            <span className="opacity-50">
                              blødt signal · {optionMapping(option)}
                            </span>
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
                  <span className="opacity-60">Tilføj et ekstra genre-/emne-trin (til sidst):</span>
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
                  {allowListScoreTables}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold tracking-wide uppercase opacity-60">
                    2 · Svar → læse-type-score (model B)
                  </h4>
                  <p className="opacity-60">
                    Hvert svar giver direkte point til læsetyperne — uafhængigt af genre/emne (som
                    kun bruges til søgningen). Udgangspunktet er seedet; rediger frit pr. svar.
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
                                  <th
                                    key={profile.key}
                                    className="px-1 py-1 text-center font-medium">
                                    {profile.emoji}
                                    <div className="font-normal opacity-60">{profile.heading}</div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {scoringOptions.map(option => {
                                const vector = answerScore(option, answerScores)
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
                  <div className="flex flex-col gap-3 border-t border-black/10 pt-2">
                    <h5 className="font-medium">
                      Allow-liste → CQL (alle options; scoren er ikke relevant i model B).{" "}
                      <span className="font-normal opacity-60">
                        ● = indgår i CQL&apos;en lige nu ud fra dine valg.
                      </span>
                    </h5>
                    {[
                      { heading: "Genrer", entries: GENRE_ENTRIES },
                      { heading: "Emner", entries: SUBJECT_ENTRIES },
                    ].map(group => (
                      <div key={group.heading} className="flex flex-col gap-1">
                        <div className="text-xs font-bold tracking-wide uppercase opacity-60">
                          {group.heading} ({group.entries.length})
                        </div>
                        <div className="overflow-x-auto">
                          <table className="border-collapse text-xs">
                            <thead>
                              <tr>
                                <th className="px-2 py-1 text-left font-medium">Option</th>
                                <th className="px-2 py-1 text-left font-medium">CQL-led</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.entries.map(entry => {
                                const active =
                                  genreLabels.includes(entry.label) ||
                                  subjectLabels.includes(entry.label)
                                return (
                                  <tr
                                    key={entry.label}
                                    className={[
                                      "border-t border-black/10 align-top",
                                      active ? "font-bold" : "",
                                    ].join(" ")}>
                                    <td className="px-2 py-1 whitespace-nowrap">
                                      {active ? "● " : ""}
                                      {entry.label}
                                    </td>
                                    <td className="px-2 py-1 font-mono break-all opacity-70">
                                      {entryClause(entry)}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
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

              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold tracking-wide uppercase opacity-60">
                  4 · Alders- og lix-tilstand
                </h4>
                <p className="opacity-60">
                  Alder og lix kommer fra læsepræference-trinnene i quizzen som INTERVALLER (begge
                  kan vælges flere). Alder:{" "}
                  {ageRanges.length > 0 ? formatRanges(ageRanges, " år") : "ikke valgt endnu"}. Lix:{" "}
                  {lixRanges.length > 0 ? formatRanges(lixRanges, "") : "ikke valgt endnu"}. Alderen
                  gater desuden hvilke genrer/emner der kan vælges. Blødt = rerank (sortér tættest
                  på øverst); hårdt = intervallet AND&apos;es direkte ind i CQL-søgningen
                  (<code>ages within</code> / <code>lix within</code>), så 0-hits og hitcount er ægte.
                </p>
                {[
                  {
                    label: "Aldersfilter",
                    mode: ageMode,
                    set: setAgeMode,
                    has: ageRanges.length > 0,
                  },
                  {
                    label: "Lixfilter",
                    mode: lixMode,
                    set: setLixMode,
                    has: lixRanges.length > 0,
                  },
                ].map(row => (
                  <div key={row.label} className="flex flex-wrap items-center gap-3">
                    <span className="w-28 font-medium">{row.label}:</span>
                    <div className="flex items-center gap-1">
                      {[
                        { key: "soft", label: "Blødt (rerank)" },
                        { key: "hard", label: "Hårdt (filtrér)" },
                      ].map(option => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => row.set(option.key as "soft" | "hard")}
                          aria-pressed={row.mode === option.key}
                          disabled={!row.has}
                          className={[
                            "border px-2 py-0.5",
                            row.mode === option.key
                              ? "border-black bg-black/10"
                              : "border-black/30",
                            !row.has ? "cursor-not-allowed opacity-40" : "",
                          ].join(" ")}>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
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
      </div>
    </section>
  )
}

export default ScoreModelDashboard
