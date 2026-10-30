import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

// The reader's edition choice, shared between the picker that sets it and the
// work page that reads it back out of the url.

// A pid is a pin to one specific edition. "newest" is the default and so is
// the absence of a choice — it is never written to the url.
export type TEditionChoice = "newest" | { pid: string }

export const DEFAULT_EDITION_CHOICE: TEditionChoice = "newest"

// The url carries the choice as a single `edition` param: a pid, or nothing at
// all for the default.
export const parseEditionChoice = (param: string | null): TEditionChoice => {
  if (!param) return DEFAULT_EDITION_CHOICE

  return { pid: param }
}

export const serializeEditionChoice = (choice: TEditionChoice): string | null => {
  if (choice === "newest") return null

  return choice.pid
}

// Label for the trigger button that opens the modal.
export const getEditionChoiceLabel = (
  choice: TEditionChoice,
  selectedManifestation: ManifestationWorkPageFragment
): string => {
  if (choice === "newest") return "Nyeste"

  return selectedManifestation.edition?.publicationYear?.year?.toString() ?? "Valgt udgave"
}
