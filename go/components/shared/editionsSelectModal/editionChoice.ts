import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

// The publication year of the edition the page shows.
export const getEditionLabel = (selectedManifestation: ManifestationWorkPageFragment): string =>
  selectedManifestation.edition?.publicationYear?.year?.toString() ?? "Valgt udgave"
