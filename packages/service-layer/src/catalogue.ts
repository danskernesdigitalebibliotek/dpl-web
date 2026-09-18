import { type CatalogueDetails, createFbiClient } from "../fbi/src"
import { resolveFbiConfig } from "./internal/resolveFbiConfig"
import type { ServiceLayerConfig } from "./types"

/**
 * What the catalogue calls these ISBNs - see ADR-004. The correction improves
 * on fields the caller already has rather than being needed to show the
 * material, so a catalogue that does not answer yields an empty map and
 * leaves every item as it was instead of failing the list along with it.
 */
export async function lookupCatalogue(
  config: ServiceLayerConfig,
  isbns: string[]
): Promise<Map<string, CatalogueDetails>> {
  // Before resolving the config: a host that lends nothing digital should not
  // have to declare where the catalogue lives.
  if (isbns.length === 0) {
    return new Map()
  }

  // Resolving the config is inside the catch, not before it: a host that never
  // configured FBI throws from getBaseUrl, and that has to leave the list
  // alone like any other unanswered search rather than fail it.
  return search(config, isbns).catch((error: unknown) => {
    // Said out loud, because the fallback is indistinguishable from a
    // catalogue that simply knows nothing: an expired token, a profile that
    // no longer allows complexSearch or a changed FBI contract would
    // otherwise take every digital title back to the provider's for good,
    // with nothing failing and nothing to notice it by.
    console.warn("Catalogue search failed; keeping the provider's descriptions", error)
    return new Map<string, CatalogueDetails>()
  })
}

async function search(
  config: ServiceLayerConfig,
  isbns: string[]
): Promise<Map<string, CatalogueDetails>> {
  const fbi = createFbiClient(resolveFbiConfig(config))
  return fbi.getCatalogueDetails(isbns)
}

/** Takes the catalogue's description of an item, field by field. */
export function applyCatalogue<T extends CatalogueDetails>(
  item: T,
  details: CatalogueDetails | undefined
): T {
  if (!details) {
    return item
  }

  return {
    ...item,
    title: details.title,
    // The catalogue can hold a work it credits nobody for. The provider's own
    // creator is a better answer than none.
    authors: details.authors.length > 0 ? details.authors : item.authors,
  }
}

/**
 * A loan request's own loan, described like a listed one. Every function that
 * hands back a LoanRequestResult goes through here, so the DTO means the same
 * thing whichever one produced it.
 */
export async function withCatalogueDetailsForRequest<
  T extends { loan: CatalogueDetails | undefined },
>(config: ServiceLayerConfig, request: Promise<T>, isbn: string): Promise<T> {
  const [result, catalogue] = await Promise.all([request, lookupCatalogue(config, [isbn])])

  return result.loan
    ? { ...result, loan: applyCatalogue(result.loan, catalogue.get(isbn)) }
    : result
}

/** The two above over a whole list, in one search. */
export async function withCatalogueDetails<T extends CatalogueDetails>(
  config: ServiceLayerConfig,
  items: T[],
  isbnOf: (item: T) => string
): Promise<T[]> {
  const catalogue = await lookupCatalogue(config, items.map(isbnOf))
  return items.map(item => applyCatalogue(item, catalogue.get(isbnOf(item))))
}
