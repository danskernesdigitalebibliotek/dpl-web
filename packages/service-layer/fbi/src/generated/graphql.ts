import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core"

/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never }

export type IdentifierTypeEnum =
  | "BARCODE"
  | "DOI"
  | "ISBN"
  | "ISMN"
  | "ISSN"
  | "MOVIE"
  | "MUSIC"
  | "NOT_SPECIFIED"
  | "ORDER_NUMBER"
  | "PUBLIZON"
  | "UPC"
  | "URI"

export type CatalogueDetailsByIsbnQueryVariables = Exact<{
  cql: string
  limit: unknown
}>

export type CatalogueDetailsByIsbnQuery = {
  complexSearch: {
    errorMessage: string | null
    works: Array<{
      titles: { full: Array<string> }
      creators: Array<{ display: string } | { display: string }>
      manifestations: {
        all: Array<{ identifiers: Array<{ type: IdentifierTypeEnum; value: string }> }>
      }
    }>
  }
}

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>["__apiType"]>
  private value: string
  public __meta__?: Record<string, any> | undefined

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value)
    this.value = value
    this.__meta__ = __meta__
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value
  }
}

export const CatalogueDetailsByIsbnDocument = new TypedDocumentString(`
    query catalogueDetailsByIsbn($cql: String!, $limit: PaginationLimitScalar!) {
  complexSearch(cql: $cql) {
    errorMessage
    works(offset: 0, limit: $limit) {
      titles {
        full
      }
      creators {
        display
      }
      manifestations {
        all {
          identifiers {
            type
            value
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  CatalogueDetailsByIsbnQuery,
  CatalogueDetailsByIsbnQueryVariables
>
