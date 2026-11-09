/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** The supported fields to query */
export type SearchQueryInput = {
  /**
   * Search for title, creator, subject or a combination.
   * This is typically used where a single search box is desired.
   */
  all?: string | null | undefined;
  /** Search for creator */
  creator?: string | null | undefined;
  /** Search for specific subject */
  subject?: string | null | undefined;
  /** Search for specific title */
  title?: string | null | undefined;
};

export type SearchWorksQueryVariables = Exact<{
  q: SearchQueryInput;
  offset: number;
  limit: unknown;
}>;


export type SearchWorksQuery = { search: { hitcount: number, works: Array<{ workId: string, titles: { full: Array<string> }, creators: Array<
        | { display: string }
        | { display: string }
      >, materialTypes: Array<{ materialTypeSpecific: { display: string } }> }> } };

export type WorkPageQueryVariables = Exact<{
  workId: string;
}>;


export type WorkPageQuery = { work: { workId: string, abstract: Array<string> | null, titles: { full: Array<string> }, creators: Array<
      | { display: string }
      | { display: string }
    >, manifestations: { bestRepresentation: { pid: string }, all: Array<{ pid: string, titles: { full: Array<string> }, materialTypes: Array<{ materialTypeSpecific: { display: string } }>, edition: { summary: string } | null, cover: { detail_207: string | null } }> } } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const SearchWorksDocument = new TypedDocumentString(`
    query searchWorks($q: SearchQueryInput!, $offset: Int!, $limit: PaginationLimitScalar!) {
  search(q: $q) {
    hitcount
    works(offset: $offset, limit: $limit) {
      workId
      titles {
        full
      }
      creators {
        display
      }
      materialTypes {
        materialTypeSpecific {
          display
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SearchWorksQuery, SearchWorksQueryVariables>;
export const WorkPageDocument = new TypedDocumentString(`
    query workPage($workId: String!) {
  work(id: $workId) {
    workId
    titles {
      full
    }
    creators {
      display
    }
    abstract
    manifestations {
      bestRepresentation {
        pid
      }
      all {
        pid
        titles {
          full
        }
        materialTypes {
          materialTypeSpecific {
            display
          }
        }
        edition {
          summary
        }
        cover {
          detail_207
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<WorkPageQuery, WorkPageQueryVariables>;