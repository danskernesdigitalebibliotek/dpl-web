import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

// The reader's edition choice, shared between the picker that sets it and the
// work page that reads it back out of the url.

// A pid pins one specific edition. No choice at all (undefined) means the
// page picks a default itself — see useDefaultObtainableEdition — and that
// default is never written to the url.
export type TEditionChoice = { pid: string } | undefined

// The url carries the choice as a single `edition` param: a pid, or nothing
// at all when there is no pinned choice.
export const parseEditionChoice = (param: string | null): TEditionChoice => {
  if (!param) return undefined

  return { pid: param }
}

export const serializeEditionChoice = (choice: TEditionChoice): string | null => choice?.pid ?? null

// Label for the trigger button that opens the modal.
export const getEditionLabel = (selectedManifestation: ManifestationWorkPageFragment): string =>
  selectedManifestation.edition?.publicationYear?.year?.toString() ?? "Valgt udgave"
