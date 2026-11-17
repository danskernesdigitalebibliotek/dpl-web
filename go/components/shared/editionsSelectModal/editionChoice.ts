import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

// Label for the trigger button that opens the modal.
export const getEditionLabel = (selectedManifestation: ManifestationWorkPageFragment): string =>
  selectedManifestation.edition?.publicationYear?.year?.toString() ?? "Valgt udgave"
