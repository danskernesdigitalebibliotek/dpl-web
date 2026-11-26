/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type GeneralMaterialTypeCodeEnum =
  | 'ARTICLES'
  | 'AUDIO_BOOKS'
  | 'BOARD_GAMES'
  | 'BOOKS'
  | 'COMICS'
  | 'COMPUTER_GAMES'
  | 'EBOOKS'
  | 'FILMS'
  | 'IMAGE_MATERIALS'
  | 'MUSIC'
  | 'NEWSPAPER_JOURNALS'
  | 'OTHER'
  | 'PODCASTS'
  | 'SHEET_MUSIC'
  | 'TV_SERIES';

export type LinkStatusEnum =
  | 'BROKEN'
  | 'GONE'
  | 'INVALID'
  | 'OK';

/** Error codes returned when an article cannot be fetched or the user is not allowed to access it. */
export type RetrieverErrorEnum =
  | 'ARTICLE_NOT_FOUND'
  | 'BORROWERCHECK_NOT_ALLOWED'
  | 'BORROWER_NOT_FOUND'
  | 'BORROWER_NOT_IN_MUNICIPALITY'
  | 'BORROWER_NOT_LOGGED_IN'
  | 'INTERNAL_SERVER_ERROR'
  | 'LIBRARY_NOT_FOUND'
  | 'NO_AGENCYID'
  | 'SERVICE_NOT_LICENSED'
  | 'SERVICE_UNAVAILABLE';

export type SuggestionTypeEnum =
  | 'COMPOSIT'
  | 'CREATOR'
  | 'SUBJECT'
  | 'TITLE';

export type ArticleSuggestQueryVariables = Exact<{
  q: string;
}>;


export type ArticleSuggestQuery = { suggest: { result: Array<{ type: SuggestionTypeEnum, term: string, work: { workId: string, titles: { main: Array<string> }, creators: Array<
          | { display: string }
          | { display: string }
        >, manifestations: { bestRepresentation: { hostPublication: { title: string } | null } } } | null }> } };

export type PeriodicalByIssnQueryVariables = Exact<{
  cql: string;
}>;


export type PeriodicalByIssnQuery = { complexSearch: { hitcount: number, errorMessage: string | null, works: Array<{ workId: string }> } };

export type RetrieverArticleQueryVariables = Exact<{
  id: string;
}>;


export type RetrieverArticleQuery = { retriever: { error: RetrieverErrorEnum | null, article: { headline: string | null, subHeadline: string | null, publishingDate: string | null, sourceName: string | null, fullTextHtml: string | null } | null } };

export type SearchArticlesQueryVariables = Exact<{
  cql: string;
  offset: number;
  limit: unknown;
}>;


export type SearchArticlesQuery = { complexSearch: { hitcount: number, errorMessage: string | null, works: Array<{ workId: string, titles: { full: Array<string> }, creators: Array<
        | { display: string }
        | { display: string }
      >, materialTypes: Array<{ materialTypeSpecific: { display: string } }>, manifestations: { bestRepresentation: { hostPublication: { summary: string } | null } } }> } };

export type WorkPageQueryVariables = Exact<{
  workId: string;
}>;


export type WorkPageQuery = { work: { workId: string, abstract: Array<string> | null, titles: { main: Array<string>, full: Array<string> }, creators: Array<
      | { display: string }
      | { display: string }
    >, fictionNonfiction: { display: string } | null, subjects: { all: Array<
        | { display: string }
        | { display: string }
        | { display: string }
        | { display: string }
        | { display: string }
        | { display: string }
        | { display: string }
        | { display: string }
      > }, manifestations: { bestRepresentation: { pid: string }, all: Array<{ pid: string, source: Array<string>, publisher: Array<string>, titles: { full: Array<string> }, creators: Array<
          | { display: string }
          | { display: string }
        >, materialTypes: Array<{ materialTypeGeneral: { code: GeneralMaterialTypeCodeEnum }, materialTypeSpecific: { code: string, display: string } }>, edition: { summary: string, publicationYear: { year: number | null } | null } | null, cover: { detail_207: string | null, detail_500: string | null }, languages: { main: Array<{ display: string }> | null } | null, physicalDescription: { summaryFull: string | null } | null, hostPublication: { title: string, issn: string | null, summary: string, year: { year: number | null } | null } | null, access: Array<
          | { __typename: 'AccessUrl', url: string, origin: string, status: LinkStatusEnum }
          | { __typename: 'DigitalArticleService', issn: string }
          | { __typename: 'Ereol' }
          | { __typename: 'InfomediaService' }
          | { __typename: 'InterLibraryLoan', loanIsPossible: boolean }
          | { __typename: 'Publizon' }
          | { __typename: 'RetrieverService', id: string }
        > }> } } | null };

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

export const ArticleSuggestDocument = new TypedDocumentString(`
    query articleSuggest($q: String!) {
  suggest(q: $q, workType: ARTICLE, limit: 10) {
    result {
      type
      term
      work {
        workId
        titles {
          main
        }
        creators {
          display
        }
        manifestations {
          bestRepresentation {
            hostPublication {
              title
            }
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ArticleSuggestQuery, ArticleSuggestQueryVariables>;
export const PeriodicalByIssnDocument = new TypedDocumentString(`
    query periodicalByIssn($cql: String!) {
  complexSearch(cql: $cql) {
    hitcount
    errorMessage
    works(offset: 0, limit: 2) {
      workId
    }
  }
}
    `) as unknown as TypedDocumentString<PeriodicalByIssnQuery, PeriodicalByIssnQueryVariables>;
export const RetrieverArticleDocument = new TypedDocumentString(`
    query retrieverArticle($id: String!) {
  retriever(id: $id) {
    error
    article {
      headline
      subHeadline
      publishingDate
      sourceName
      fullTextHtml
    }
  }
}
    `) as unknown as TypedDocumentString<RetrieverArticleQuery, RetrieverArticleQueryVariables>;
export const SearchArticlesDocument = new TypedDocumentString(`
    query searchArticles($cql: String!, $offset: Int!, $limit: PaginationLimitScalar!) {
  complexSearch(cql: $cql) {
    hitcount
    errorMessage
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
      manifestations {
        bestRepresentation {
          hostPublication {
            summary
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SearchArticlesQuery, SearchArticlesQueryVariables>;
export const WorkPageDocument = new TypedDocumentString(`
    query workPage($workId: String!) {
  work(id: $workId) {
    workId
    titles {
      main
      full
    }
    creators {
      display
    }
    abstract
    fictionNonfiction {
      display
    }
    subjects {
      all {
        display
      }
    }
    manifestations {
      bestRepresentation {
        pid
      }
      all {
        pid
        source
        publisher
        titles {
          full
        }
        creators {
          display
        }
        materialTypes {
          materialTypeGeneral {
            code
          }
          materialTypeSpecific {
            code
            display
          }
        }
        edition {
          summary
          publicationYear {
            year
          }
        }
        cover {
          detail_207
          detail_500
        }
        languages {
          main {
            display
          }
        }
        physicalDescription {
          summaryFull
        }
        hostPublication {
          title
          issn
          summary
          year {
            year
          }
        }
        access {
          __typename
          ... on AccessUrl {
            url
            origin
            status
          }
          ... on DigitalArticleService {
            issn
          }
          ... on RetrieverService {
            id
          }
          ... on InterLibraryLoan {
            loanIsPossible
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<WorkPageQuery, WorkPageQueryVariables>;