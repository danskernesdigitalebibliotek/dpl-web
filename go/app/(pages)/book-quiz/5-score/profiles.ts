import { TAllowedEntry } from "../2-tilladt-liste/allowedList"

export type TProfile = {
  key: string
  emoji: string
  heading: string
  text: string
}

// "Læse-typer" — rent kuratering (overskrift/emoji/tekst). Rækkefølgen afgør
// også uafgjorte (den første vinder). Ændrer ikke hvilke bøger der vises.
export const PROFILES: TProfile[] = [
  {
    key: "eventyrer",
    emoji: "🗺️",
    heading: "Eventyreren",
    text: "Du elsker at blive revet med på store rejser og vilde opdagelser.",
  },
  {
    key: "gyser",
    emoji: "🦇",
    heading: "Den modige",
    text: "Du tør godt få kuldegysninger — jo uhyggeligere, jo bedre.",
  },
  {
    key: "droemmer",
    emoji: "💭",
    heading: "Drømmeren",
    text: "Magi, følelser og venskaber — du kan lide bøger, der rører dig.",
  },
  {
    key: "opdager",
    emoji: "🔭",
    heading: "Opdageren",
    text: "Du vil forstå verden: natur, historie og det, der er virkeligt.",
  },
  {
    key: "griner",
    emoji: "🤣",
    heading: "Grineren",
    text: "Du vil grine højt — sjove og skøre historier er dig.",
  },
]

const FALLBACK: TProfile = {
  key: "laesehest",
  emoji: "📚",
  heading: "Læsehesten",
  text: "Vælg et par emojis, så finder vi din læse-type.",
}

/**
 * Summer point fra de valgte posters `score` og vælg den højeste "læse-type".
 *
 * @param entries - De valgte tilladt-liste-poster.
 * @returns Den valgte profil og de summerede point (til evt. visning/debug).
 */
export const pickProfile = (
  entries: TAllowedEntry[]
): { profile: TProfile; scores: Record<string, number> } => {
  const scores: Record<string, number> = {}
  for (const entry of entries) {
    for (const [key, points] of Object.entries(entry.score ?? {})) {
      scores[key] = (scores[key] ?? 0) + points
    }
  }

  let best: TProfile | null = null
  for (const profile of PROFILES) {
    const score = scores[profile.key] ?? 0
    if (score > 0 && (!best || score > (scores[best.key] ?? 0))) {
      best = profile
    }
  }

  return { profile: best ?? FALLBACK, scores }
}
