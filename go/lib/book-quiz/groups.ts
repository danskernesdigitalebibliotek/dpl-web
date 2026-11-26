// A group gathers many FBI facet values under one child-friendly name. Each
// genre, mood and subject answer points at one group (see questions.ts), and a
// group matches a work when any of its clauses match (OR). The terms come from the
// curated term list, all on the phrase index so multi-word values work.
//
// Terms that are commented out were not relevant in the client test. They are
// kept so they can be switched back on for testing.

export type TBookQuizClause = { cqlIndex: string; cqlValues: string[] }

// The content colours, see QUIZ_COLOR_CLASSES.
export type TBookQuizColor = "green" | "pink" | "blue" | "purple" | "orange"

export type TBookQuizGroup = {
  // Short name for section titles, e.g. "Fantasy" in "Sjove fantasybøger".
  label: string
  // The quiz takes this colour when an answer with the group is chosen.
  color?: TBookQuizColor
  match: TBookQuizClause[]
}

const genre = (cqlValues: string[]): TBookQuizClause => ({
  cqlIndex: "phrase.genreandform",
  cqlValues,
})
const subject = (cqlValues: string[]): TBookQuizClause => ({
  cqlIndex: "phrase.subject",
  cqlValues,
})

// --- Genre ---

export const THRILLER: TBookQuizGroup = {
  label: "Spænding",
  color: "pink",
  match: [genre(["spænding", "krimi"]), subject(["action", "mysterier"])],
}

export const FANTASY: TBookQuizGroup = {
  label: "Fantasy",
  color: "purple",
  match: [genre(["fantasy"])],
}

export const FRIENDS: TBookQuizGroup = {
  label: "Venner",
  color: "orange",
  // No genre exists for friendship, only subjects.
  match: [subject(["venner", "veninder", "venskab", "venskaber", "skole"])],
}

export const NONFICTION: TBookQuizGroup = {
  label: "Fakta",
  color: "blue",
  // Non-fiction is not a genre in FBI but its own index.
  match: [{ cqlIndex: "term.fictionnonfiction", cqlValues: ["nonfiction"] }],
}

export const SCIFI: TBookQuizGroup = {
  label: "Science fiction",
  color: "blue",
  match: [
    genre(["science fiction"]),
    subject([
      "rumfartøjer",
      "rumrejser",
      "rummet",
      "raketter",
      "rumvæsener",
      "astronauter",
      "rumstationer",
      "månelandinger",
      "stjerner",
      "månen",
      "solsystemet",
      "rumskibe",
      "planeter",
      "ubåde",
      "robotter",
      "dystopier",
    ]),
  ],
}

export const HISTORY: TBookQuizGroup = {
  label: "Historie",
  color: "orange",
  match: [
    genre(["historiske romaner"]),
    subject([
      "historie",
      "middelalderen",
      "1700-tallet",
      "1800-tallet",
      "1900-tallet",
      "verdenshistorie",
      "den 2. verdenskrig",
      "besættelsestiden",
      "mellemkrigstiden",
      "modstandbevægelsen",
      "oldtiden",
      "antikken",
      "romerriget",
      "vikingetid",
      "vikinger",
      "vikingetiden",
    ]),
  ],
}

// --- Mood. Gys and romantik have no genre, only subjects. ---

export const FUNNY: TBookQuizGroup = {
  label: "Sjov",
  color: "orange",
  match: [genre(["sjove bøger"]), subject(["sjov"])],
}

export const HORROR: TBookQuizGroup = {
  label: "Gys",
  color: "purple",
  match: [
    subject([
      "gys",
      "spøgelser",
      "zombier",
      "hekse",
      "uhyggelig",
      "uhygge",
      "monstre",
      "vampyrer",
      "varulve",
      "splatter",
      "genfærd",
      "halloween",
    ]),
  ],
}

export const ROMANCE: TBookQuizGroup = {
  label: "Romantik",
  color: "pink",
  match: [
    subject(["kærlighed", "forelskelse", "kærester", "seksualitet", "romantisk", "romantik"]),
  ],
}

// --- Subjects ---

export const ANIMALS: TBookQuizGroup = {
  label: "Dyr",
  color: "green",
  match: [
    subject([
      "dyr",
      "vilde dyr",
      "pattedyr",
      "insekter",
      "øgler",
      "hunde",
      "katte",
      "kryb",
      // "forhistoriske dyr",
      "kæledyr",
      "husdyr",
      // "dinosaurer",
      "fugle",
      "dyreliv",
    ]),
  ],
}

export const GAMING: TBookQuizGroup = {
  label: "Gaming",
  color: "blue",
  match: [subject(["gaming", "computerspil", "fortnite", "roblox", "minecraft"])],
}

export const SPORT: TBookQuizGroup = {
  label: "Sport",
  color: "green",
  match: [
    subject([
      "sport",
      "fodbold",
      "tennis",
      "cykling",
      "håndbold",
      "badminton",
      "motorsport",
      "håndboldspillere",
      "fodboldspillere",
    ]),
  ],
}

export const CLIMATE: TBookQuizGroup = {
  label: "Klima",
  color: "blue",
  match: [
    subject([
      "klima",
      "miljø",
      "klimaændringer",
      "global opvarmning",
      "klima bevidsthed",
      "natur og miljø",
    ]),
  ],
}
