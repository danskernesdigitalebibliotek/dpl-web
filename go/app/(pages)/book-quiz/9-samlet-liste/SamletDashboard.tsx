"use client"

import React, { useEffect, useState } from "react"

import {
  BookQuizComplexSearchQuery,
  useBookQuizComplexSearchQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"

import { TSubjectGroup, genreGroupById, subjectGroupById } from "../8-grupper/groups"
import { QUESTIONS, TQuizQuestion } from "../8-grupper/questions"
import BookQuizCover from "../_shared/BookQuizCover"
import { TRange } from "../_shared/audienceCql"
import { MAX_TIERS, TProfile, buildTiers } from "./tiers"

// Hvert trin henter en pulje; den flettede liste viser de bedste TOP_N.
const TIER_LIMIT = 30
const TOP_N = 20
// Hvor mange år et værks aldersspænd må stikke ud over det valgte, før det
// tæller som "for bredt" (fx 10–14 år ved valgt 9–10 = 4 år udenfor).
const MAX_AGE_SPILL = 2

// Samlet score (lavere = bedre): ét trin ned ad stigen koster lige så meget som
// ét år uden for det valgte alderstrin. Værker uden aldersdata tæller som lige
// over grænsen; læsehest-boost giver et halvt point straf til værker MED lix.
type TRankMode = "tier" | "score"
const TIER_WEIGHT = 1
const NO_AGE_SPILL = MAX_AGE_SPILL + 1
const LIX_PENALTY = 0.5

type TPhase = "quiz" | "loading" | "result"
type TQuizWork = BookQuizComplexSearchQuery["complexSearch"]["works"][number]

// --- Værk-metadata (lix/alder ligger ofte kun på den fysiske udgave) ---

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

// Alders-"spild": hvor mange år værkets spænd stikker ud over det valgte
// interval. 0 = ligger helt inden for. Det hårde CQL-filter sikrer kun overlap,
// så uden dette ville en 10–14-årsbog tælle lige så godt som en 9–10-årsbog.
const ageSpill = (work: TQuizWork, range: TRange | undefined): number | null => {
  if (!range) return 0
  const ages = getWorkAges(work)
  if (!ages) return null
  return Math.max(0, range[0] - ages.low) + Math.max(0, ages.high - range[1])
}

// --- Svar → profil ---

const deriveProfile = (answers: Record<string, string[]>): TProfile => {
  const pick = (questionId: string) => {
    const question = QUESTIONS.find(current => current.id === questionId)
    return (answers[questionId] ?? []).flatMap(id => {
      const option = question?.options.find(current => current.id === id)
      return option ? [option] : []
    })
  }
  const genreId = pick("genre")[0]?.genreGroupId
  const moodId = pick("stemning")[0]?.genreGroupId
  return {
    genre: genreId ? genreGroupById(genreId) : undefined,
    mood: moodId ? genreGroupById(moodId) : undefined,
    subjects: pick("emne").flatMap(option => {
      const group = option.subjectGroupId ? subjectGroupById(option.subjectGroupId) : undefined
      return group ? [group] : ([] as TSubjectGroup[])
    }),
    ageRange: pick("alder")[0]?.ageRange,
    readingLevel: pick("laeseniveau")[0]?.readingLevel,
  }
}

type TRanked = {
  work: TQuizWork
  index: number
  score: number
  tierIndex: number
  tierLabel: string
  spill: number | null
  lix: number | null
}

const SamletDashboard = () => {
  const [phase, setPhase] = useState<TPhase>("quiz")
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [excludeWide, setExcludeWide] = useState(true)
  const [showDebug, setShowDebug] = useState(true)
  const [rankMode, setRankMode] = useState<TRankMode>("tier")

  const profile = deriveProfile(answers)
  const tiers = buildTiers(profile)
  const cqls = Array.from({ length: MAX_TIERS }, (_, index) => tiers[index]?.cql ?? "")

  // Fast antal hooks (MAX_TIERS) — ubrugte trin er bare disabled.
  const enabled = (cql: string) => phase === "result" && cql.length > 0
  const vars = (cql: string) => ({ cql, offset: 0, limit: TIER_LIMIT, filters: {} })
  const r0 = useBookQuizComplexSearchQuery(vars(cqls[0]), { enabled: enabled(cqls[0]) })
  const r1 = useBookQuizComplexSearchQuery(vars(cqls[1]), { enabled: enabled(cqls[1]) })
  const r2 = useBookQuizComplexSearchQuery(vars(cqls[2]), { enabled: enabled(cqls[2]) })
  const r3 = useBookQuizComplexSearchQuery(vars(cqls[3]), { enabled: enabled(cqls[3]) })
  const results = [r0, r1, r2, r3]

  useEffect(() => {
    if (phase !== "loading") return
    const timer = setTimeout(() => setPhase("result"), 1200)
    return () => clearTimeout(timer)
  }, [phase])

  // Flet trinene: første (mest specifikke) trin et værk optræder i vinder.
  // "tier": trin først, inden for trinet mindst alders-spild, så læsehest-boost
  // (værker uden lix), så FBI's egen rækkefølge.
  // "score": samlet score på tværs af trin (se TIER_WEIGHT), sorteres nedenfor.
  const seen = new Set<string>()
  const merged: TRanked[] = []
  const tierCandidates = tiers.map((tier, tierIndex) => {
    const works = results[tierIndex].data?.complexSearch.works ?? []
    let candidates = 0
    let droppedWide = 0
    const ranked = works
      .filter(work => !seen.has(work.workId))
      .map((work, index): TRanked => {
        const spill = ageSpill(work, profile.ageRange)
        const lix = getWorkLix(work)
        const lixPenalty = profile.readingLevel === "hard" && lix != null ? LIX_PENALTY : 0
        return {
          work,
          index,
          tierIndex,
          tierLabel: tier.label,
          spill,
          lix,
          score: tierIndex * TIER_WEIGHT + (spill ?? NO_AGE_SPILL) + lixPenalty,
        }
      })
      .sort((a, b) => {
        const spillA = a.spill ?? Infinity
        const spillB = b.spill ?? Infinity
        if (spillA !== spillB) return spillA - spillB
        if (profile.readingLevel === "hard") {
          const boostA = a.lix == null ? 0 : 1
          const boostB = b.lix == null ? 0 : 1
          if (boostA !== boostB) return boostA - boostB
        }
        return a.index - b.index
      })
    for (const entry of ranked) {
      seen.add(entry.work.workId)
      if (excludeWide && entry.spill != null && entry.spill > MAX_AGE_SPILL) {
        droppedWide++
        continue
      }
      merged.push(entry)
      candidates++
    }
    return {
      tier,
      hitcount: results[tierIndex].data?.complexSearch.hitcount ?? 0,
      isFetching: results[tierIndex].isFetching,
      isError: results[tierIndex].isError,
      candidates,
      droppedWide,
    }
  })
  if (rankMode === "score") {
    merged.sort((a, b) => a.score - b.score || a.tierIndex - b.tierIndex || a.index - b.index)
  }
  const top = merged.slice(0, TOP_N)
  // "shown" = hvor mange af trinets bøger der faktisk er med i de TOP_N viste.
  const tierStats = tierCandidates.map((stat, tierIndex) => ({
    ...stat,
    shown: top.filter(entry => entry.tierIndex === tierIndex).length,
  }))
  const isFetching = tierStats.some(stat => stat.isFetching)

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

  const renderBook = (entry: TRanked) => {
    const ages = getWorkAges(entry.work)
    return (
      <li key={entry.work.workId} className="flex items-start gap-3 py-2 text-sm">
        <BookQuizCover work={entry.work} />
        <div className="flex min-w-0 flex-col">
          <div>
            <span className="font-medium">{entry.work.titles.full[0] ?? "Uden titel"}</span>
            {entry.work.creators.length > 0 ? (
              <span className="opacity-70"> · {displayCreators(entry.work.creators, 2)}</span>
            ) : null}
          </div>
          <div className="opacity-50">
            {ages ? `${ages.low}–${ages.high} år` : "alder —"}
            {entry.lix != null ? ` · lix ${entry.lix}` : " · lix —"}
          </div>
          {showDebug ? (
            <div className="text-xs opacity-60">
              trin {entry.tierIndex + 1}: {entry.tierLabel}
              {entry.spill != null ? ` · ${entry.spill} år udenfor` : " · ingen aldersdata"}
              {rankMode === "score" ? ` · score ${entry.score}` : ""}
            </div>
          ) : null}
        </div>
      </li>
    )
  }

  return (
    <section className="mx-auto my-8 flex w-full max-w-4xl flex-col gap-6 px-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Boganbefaler-quiz — PoC 9: Én samlet liste</h1>
        <p className="opacity-70">
          Samme spørgsmål og pakker som PoC 8, men barnet får ÉN rangeret liste. Svarene bliver til
          en profil, og profilen bliver til en stige af søgninger fra mest til mindst specifik
          (genre + stemning + emner → genre + stemning → genre + emner → genre). Bøger fra øverste
          trin står først; løsere trin fylder op. Alder og “let at læse” er hårde på alle trin, og
          bøger med et for bredt aldersspænd sorteres ned eller udelukkes.
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
                  const selected = chosenIds.includes(option.id)
                  return (
                    <button
                      key={option.id}
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
                  )
                })}
              </div>
            </div>
          ) : null}

          {phase === "loading" ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="text-3xl">💣 🦄 🧪 🪐 🕰️</div>
              <h2 className="text-2xl font-bold">Vi har næsten noget.</h2>
            </div>
          ) : null}

          {phase === "result" ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold">Bøger til dig</h2>
              {isFetching ? <p className="text-sm opacity-60">Henter…</p> : null}
              {tierStats.some(stat => stat.isError) ? (
                <p className="text-red-700">Fejl ved søgning i FBI.</p>
              ) : null}
              <ul className="flex flex-col divide-y divide-black/10">
                {/* Indsigt: skillelinje før første bog fra hvert trin, så stigen ses i listen. */}
                {top.flatMap((entry, index) =>
                  showDebug && rankMode === "tier" && entry.tierIndex !== top[index - 1]?.tierIndex
                    ? [
                        <li
                          key={`tier-${entry.tierIndex}`}
                          className="pt-3 pb-1 text-xs font-bold tracking-wide uppercase opacity-60">
                          — Trin {entry.tierIndex + 1}: {entry.tierLabel} —
                        </li>,
                        renderBook(entry),
                      ]
                    : [renderBook(entry)]
                )}
              </ul>
              {!isFetching && top.length === 0 ? (
                <p className="opacity-70">Ingen bøger matchede.</p>
              ) : null}
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

      {/* --- Debug: profil → stige → bidrag pr. trin --- */}
      <div className="flex flex-col border border-dashed border-black/30 text-sm">
        <button
          type="button"
          onClick={() => setShowDebug(value => !value)}
          aria-expanded={showDebug}
          className="flex items-center justify-between px-3 py-2 text-left">
          <span className="text-xs font-bold tracking-wide uppercase opacity-60">
            PoC-indsigt — profil og søgestige
          </span>
          <span className="opacity-60">{showDebug ? "skjul ▲" : "vis ▼"}</span>
        </button>
        {showDebug ? (
          <div className="flex flex-col gap-3 border-t border-black/10 p-3">
            <div>
              <span className="font-medium">Profil:</span> genre {profile.genre?.label ?? "—"} ·
              stemning {profile.mood?.label ?? "—"} · emner{" "}
              {profile.subjects.map(group => group.label).join(", ") || "—"} · alder{" "}
              {profile.ageRange ? `${profile.ageRange[0]}–${profile.ageRange[1]}` : "—"} ·
              læseniveau {profile.readingLevel ?? "—"}
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={excludeWide}
                onChange={event => setExcludeWide(event.target.checked)}
              />
              Udeluk bøger hvis aldersspænd stikker mere end {MAX_AGE_SPILL} år ud over det valgte
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Sortering:</span>
              {(
                [
                  ["tier", "Trin først"],
                  ["score", "Samlet score (trin + alder)"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRankMode(mode)}
                  aria-pressed={rankMode === mode}
                  className={[
                    "border px-2 py-0.5",
                    rankMode === mode ? "border-black bg-black/10" : "border-black/30",
                  ].join(" ")}>
                  {label}
                </button>
              ))}
              <span className="opacity-50">
                score = (trin − 1) × {TIER_WEIGHT} + år udenfor
                {profile.readingLevel === "hard" ? ` + ${LIX_PENALTY} hvis lix` : ""} (lavest først)
              </span>
            </div>
            {tierStats.length === 0 ? <p className="opacity-60">— ingen svar endnu —</p> : null}
            {tierStats.map((stat, index) => (
              <div key={stat.tier.id} className="flex flex-col gap-1 border-t border-black/10 pt-2">
                <div>
                  <span className="font-medium">
                    Trin {index + 1}: {stat.tier.label}
                  </span>{" "}
                  <span className="opacity-60">
                    · {stat.hitcount} hits · {stat.shown} af {TOP_N} viste · {stat.candidates}{" "}
                    kandidater
                    {stat.droppedWide > 0 ? ` · ${stat.droppedWide} for brede` : ""}
                    {stat.isFetching ? " · henter…" : ""}
                  </span>
                </div>
                <pre
                  className="border border-black/20 bg-black/5 p-2 text-xs break-words
                    whitespace-pre-wrap">
                  {stat.tier.cql}
                </pre>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default SamletDashboard
