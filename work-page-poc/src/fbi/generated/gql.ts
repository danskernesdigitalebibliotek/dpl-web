/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query searchWorks($q: SearchQueryInput!, $offset: Int!, $limit: PaginationLimitScalar!) {\n  search(q: $q) {\n    hitcount\n    works(offset: $offset, limit: $limit) {\n      workId\n      titles {\n        full\n      }\n      creators {\n        display\n      }\n      materialTypes {\n        materialTypeSpecific {\n          display\n        }\n      }\n    }\n  }\n}": typeof types.SearchWorksDocument,
    "query workPage($workId: String!) {\n  work(id: $workId) {\n    workId\n    titles {\n      full\n    }\n    creators {\n      display\n    }\n    abstract\n    manifestations {\n      bestRepresentation {\n        pid\n      }\n      all {\n        pid\n        titles {\n          full\n        }\n        materialTypes {\n          materialTypeSpecific {\n            display\n          }\n        }\n        edition {\n          summary\n        }\n        cover {\n          detail_207\n        }\n      }\n    }\n  }\n}": typeof types.WorkPageDocument,
};
const documents: Documents = {
    "query searchWorks($q: SearchQueryInput!, $offset: Int!, $limit: PaginationLimitScalar!) {\n  search(q: $q) {\n    hitcount\n    works(offset: $offset, limit: $limit) {\n      workId\n      titles {\n        full\n      }\n      creators {\n        display\n      }\n      materialTypes {\n        materialTypeSpecific {\n          display\n        }\n      }\n    }\n  }\n}": types.SearchWorksDocument,
    "query workPage($workId: String!) {\n  work(id: $workId) {\n    workId\n    titles {\n      full\n    }\n    creators {\n      display\n    }\n    abstract\n    manifestations {\n      bestRepresentation {\n        pid\n      }\n      all {\n        pid\n        titles {\n          full\n        }\n        materialTypes {\n          materialTypeSpecific {\n            display\n          }\n        }\n        edition {\n          summary\n        }\n        cover {\n          detail_207\n        }\n      }\n    }\n  }\n}": types.WorkPageDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query searchWorks($q: SearchQueryInput!, $offset: Int!, $limit: PaginationLimitScalar!) {\n  search(q: $q) {\n    hitcount\n    works(offset: $offset, limit: $limit) {\n      workId\n      titles {\n        full\n      }\n      creators {\n        display\n      }\n      materialTypes {\n        materialTypeSpecific {\n          display\n        }\n      }\n    }\n  }\n}"): typeof import('./graphql').SearchWorksDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query workPage($workId: String!) {\n  work(id: $workId) {\n    workId\n    titles {\n      full\n    }\n    creators {\n      display\n    }\n    abstract\n    manifestations {\n      bestRepresentation {\n        pid\n      }\n      all {\n        pid\n        titles {\n          full\n        }\n        materialTypes {\n          materialTypeSpecific {\n            display\n          }\n        }\n        edition {\n          summary\n        }\n        cover {\n          detail_207\n        }\n      }\n    }\n  }\n}"): typeof import('./graphql').WorkPageDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
