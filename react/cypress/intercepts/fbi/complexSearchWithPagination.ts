import { buildComplexSearchWithPaginationResponse } from "../../factories/fbi/complexSearchWithPagination.factory";

export const givenComplexSearchWithPaginationResponse = () => {
  cy.interceptGraphql({
    operationName: "complexSearchWithPagination",
    body: buildComplexSearchWithPaginationResponse()
  });
};
