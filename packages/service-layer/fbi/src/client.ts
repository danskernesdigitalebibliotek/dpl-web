import {
  CatalogueDetailsByIsbnDocument,
  type CatalogueDetailsByIsbnQueryVariables,
} from "./generated/graphql"
import { type CatalogueDetails, parseAndMapCatalogueDetails } from "./mappers/catalogue.mapper"
import type { FbiConfig } from "./types"

// FBI caps a complexSearch page at 100 works. The page is counted in works,
// not in search terms: one ISBN can match more than one work record, so asking
// for isbns.length of them can truncate the answer and drop a material that
// was searched for.
const MAX_WORKS = 100

// Ids are interpolated into CQL, and the whole batch travels as one query, so
// one id that is not an ISBN would cost every material in the list its
// correction. A DigitalLoan's materialId is an ISBN-13, but the older
// ISBN-10 also reaches the catalogue, and its check digit can be an X.
const isIsbn = (value: string) => /^(?:[0-9]{13}|[0-9]{9}[0-9X])$/i.test(value)

// CQL is FBI's query language; `term.isbn` resolves an ISBN to its work.
const isbnCql = (isbns: string[]) => isbns.map(isbn => `term.isbn=${isbn}`).join(" OR ")

// FBI answers a malformed or unauthorised query with 200 and an `errors` array,
// so the status alone does not say whether the search succeeded.
type GraphQlResponse = {
  data?: unknown
  errors?: { message?: string }[]
}

// Every operation is posted to the same /graphql endpoint, so a network log
// shows nothing but a row of identical requests. Appending the operation name
// as a valueless query parameter labels ours without changing it - the gateway
// ignores the parameter, and the consuming apps tag their own calls the same
// way.
const operationNamePattern = /\b(?:query|mutation|subscription)\s+(\w+)/

const taggedUrl = (baseUrl: string, document: string) => {
  const operationName = operationNamePattern.exec(document)?.[1]
  if (!operationName) {
    return baseUrl
  }

  return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${operationName}`
}

export function createFbiClient(config: FbiConfig) {
  const request = async (document: string, variables: unknown): Promise<unknown> => {
    const authHeader = await config.getAuthHeader()
    const response = await fetch(taggedUrl(config.baseUrl, document), {
      method: "POST",
      headers: {
        authorization: authHeader,
        "content-type": "application/json",
      },
      body: JSON.stringify({ query: document, variables }),
    })

    if (!response.ok) {
      throw new Error(`FBI query failed: ${response.status} ${response.statusText}`)
    }

    const { data, errors } = (await response.json()) as GraphQlResponse
    if (errors && errors.length > 0) {
      throw new Error(`FBI query failed: ${errors[0]?.message ?? "unknown error"}`)
    }
    return data
  }

  return {
    /**
     * How the catalogue describes the materials with these ISBNs, as one
     * search. The map omits what FBI does not know, so a caller reads a
     * correction where there is one and keeps what it had otherwise.
     */
    getCatalogueDetails: async (isbns: string[]): Promise<Map<string, CatalogueDetails>> => {
      const searchable = isbns.filter(isIsbn)
      if (searchable.length === 0) {
        return new Map()
      }

      const variables: CatalogueDetailsByIsbnQueryVariables = {
        cql: isbnCql(searchable),
        limit: MAX_WORKS,
      }
      const raw = await request(CatalogueDetailsByIsbnDocument.toString(), variables)

      return parseAndMapCatalogueDetails(raw, searchable)
    },
  }
}
