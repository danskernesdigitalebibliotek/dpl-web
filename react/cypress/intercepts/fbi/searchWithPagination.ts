import { FictionNonfictionCodeEnum } from "../../../src/core/dbc-gateway/generated/graphql";
import { manifestationFactory } from "../../factories/manifestation/manifestation.factory";
import { workSmallFactory } from "../../factories/fbi/workSmall.factory";

export const givenSearchWithPaginationResponse = () => {
  cy.interceptGraphql({
    operationName: "searchWithPagination",
    fixtureFilePath: "search-result/facet-browser/searchWithPagination.json"
  });
};

export const givenSearchWithPaginationEmptyResponse = () => {
  cy.interceptGraphql({
    operationName: "searchWithPagination",
    body: {
      data: {
        search: {
          hitcount: 0,
          works: []
        }
      }
    }
  });
};

export const SHELFMARK_TEXT = "99.4 Henry";

const givenSearchResultWithFictionNonfiction = (fictionNonfiction: {
  display: string;
  code: FictionNonfictionCodeEnum;
}) => {
  const manifestation = manifestationFactory.build({
    fictionNonfiction,
    shelfmark: { shelfmark: SHELFMARK_TEXT, postfix: "Levin" }
  });
  const work = workSmallFactory.build({
    manifestations: {
      all: [manifestation],
      latest: manifestation,
      bestRepresentation: manifestation
    }
  });
  cy.interceptGraphql({
    operationName: "searchWithPagination",
    body: { data: { search: { hitcount: 1, works: [work] } } }
  });
};

export const givenSearchWithFictionNonfictionNotSpecifiedResponse = () =>
  givenSearchResultWithFictionNonfiction({
    display: "Vides ikke",
    code: FictionNonfictionCodeEnum.NotSpecified
  });

export const givenSearchWithNonfictionResponse = () =>
  givenSearchResultWithFictionNonfiction({
    display: "faglitteratur",
    code: FictionNonfictionCodeEnum.Nonfiction
  });
