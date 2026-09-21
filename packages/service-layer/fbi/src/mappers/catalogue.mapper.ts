import { z } from "zod"

import type { CatalogueDetailsByIsbnQuery } from "../generated/graphql"

// How the catalogue describes a material. Not a public domain type: it exists
// to correct the fields on the DTOs the apps already read.
export type CatalogueDetails = {
  title: string
  authors: string[]
}

// zod strips unknown keys, so added FBI fields do not break parsing.
const SearchResponseSchema = z.object({
  complexSearch: z.object({
    errorMessage: z.string().nullish(),
    works: z.array(
      z.object({
        titles: z.object({ full: z.array(z.string()) }),
        creators: z.array(z.object({ display: z.string() })),
        manifestations: z.object({
          all: z.array(
            z.object({
              identifiers: z.array(z.object({ type: z.string(), value: z.string() })),
            })
          ),
        }),
      })
    ),
  }),
})

// Holds the schema to the generated contract: a regenerated document it no
// longer accepts stops compiling here, not in production.
type _ContractIsAccepted<
  T extends z.input<typeof SearchResponseSchema> = CatalogueDetailsByIsbnQuery,
> = T

/**
 * Catalogue details for each of `isbns` the search found a work for, so a
 * caller looks up by the ISBN it asked about without knowing which
 * manifestation answered. An ISBN the catalogue does not know is absent, as
 * is a work with no title - there is nothing to correct with.
 */
export function parseAndMapCatalogueDetails(
  raw: unknown,
  isbns: string[]
): Map<string, CatalogueDetails> {
  const { complexSearch } = SearchResponseSchema.parse(raw)
  if (complexSearch.errorMessage) {
    throw new Error(`FBI rejected the catalogue search: ${complexSearch.errorMessage}`)
  }

  const requested = new Set(isbns)
  const byIsbn = new Map<string, CatalogueDetails>()

  for (const work of complexSearch.works) {
    const title = work.titles.full[0]
    if (!title) continue

    const details = { title, authors: work.creators.map(({ display }) => display) }
    // A work is matched through any of its editions, so it answers for
    // whichever of the requested ISBNs it carries.
    work.manifestations.all
      .flatMap(({ identifiers }) => identifiers)
      .filter(({ type, value }) => type === "ISBN" && requested.has(value))
      .forEach(({ value }) => byIsbn.set(value, details))
  }

  return byIsbn
}
