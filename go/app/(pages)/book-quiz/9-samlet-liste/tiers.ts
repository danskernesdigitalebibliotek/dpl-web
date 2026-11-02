import { TClauseGroup, TGenreGroup, TSubjectGroup } from "../8-grupper/groups"
import { TReadingLevel } from "../8-grupper/questions"
import { TRange, withHardAudienceFilters } from "../_shared/audienceCql"

// PoC 9: i stedet for én liste pr. genregruppe (PoC 8) bygger vi en "stige" af
// søgninger fra mest til mindst specifik. Resultaterne flettes til ÉN liste:
// bøger fra det øverste trin, der har hits, kommer først, og de løsere trin
// fylder op. Så får barnet aldrig 0 bøger, og de bedste match står øverst.
//
// Alder og "let at læse" er HÅRDE på alle trin (de må aldrig slækkes) —
// det er kun genre/stemning/emner, der slækkes nedad i stigen.

export type TProfile = {
  genre?: TGenreGroup
  mood?: TGenreGroup
  subjects: TSubjectGroup[]
  ageRange?: TRange
  readingLevel?: TReadingLevel
}

export type TTier = { id: string; label: string; cql: string }

// Maks antal trin = antal søge-hooks i dashboardet.
export const MAX_TIERS = 4

const EASY_CQL = 'phrase.generalaudience="let at læse"'

const orTerms = (clauses: TClauseGroup[]) => {
  const terms = clauses.flatMap(clause =>
    clause.cqlValues
      .filter(value => value.trim() !== "")
      .map(value => `${clause.cqlIndex}="${value}"`)
  )
  return terms.length > 0 ? `(${terms.join(" OR ")})` : ""
}

type TPart = { key: "genre" | "mood" | "subjects"; label: string; cql: string }

// Stigens rækkefølge: alle tre → genre+stemning → genre+emner → genre → …
// Kombinationer med et tomt led springes over; dubletter fjernes.
const LADDER: TPart["key"][][] = [
  ["genre", "mood", "subjects"],
  ["genre", "mood"],
  ["genre", "subjects"],
  ["genre"],
  ["mood", "subjects"],
  ["mood"],
  ["subjects"],
]

export const buildTiers = (profile: TProfile): TTier[] => {
  const parts: Record<TPart["key"], TPart> = {
    genre: {
      key: "genre",
      label: profile.genre?.label ?? "",
      cql: orTerms(profile.genre?.match ?? []),
    },
    mood: {
      key: "mood",
      label: profile.mood?.label ?? "",
      cql: orTerms(profile.mood?.match ?? []),
    },
    subjects: {
      key: "subjects",
      label: profile.subjects.map(group => group.label).join("/"),
      cql: profile.subjects
        .map(group => orTerms(group.match))
        .filter(Boolean)
        .join(" OR "),
    },
  }

  const audience = {
    ageRanges: profile.ageRange ? [profile.ageRange] : [],
    lixRanges: [],
    ageMode: "hard" as const,
    lixMode: "soft" as const,
  }

  const tiers: TTier[] = []
  for (const keys of LADDER) {
    const included = keys.map(key => parts[key])
    if (included.some(part => part.cql === "")) continue
    const base = included.map(part => `(${part.cql})`).join(" AND ")
    const withAge = withHardAudienceFilters(base, audience)
    const cql = profile.readingLevel === "easy" ? `${withAge} AND ${EASY_CQL}` : withAge
    if (tiers.some(tier => tier.cql === cql)) continue
    tiers.push({ id: keys.join("+"), label: included.map(part => part.label).join(" + "), cql })
    if (tiers.length === MAX_TIERS) break
  }
  return tiers
}
