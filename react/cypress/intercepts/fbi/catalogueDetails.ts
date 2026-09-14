import {
  type CatalogueMaterial,
  buildCatalogueDetailsResponse
} from "../../factories/fbi/catalogueDetails.factory";

/**
 * Given: what the catalogue calls these materials.
 *
 * FBI is searched for every digital material the service layer describes, so
 * a spec that renders one either states the catalogue's answer here or uses
 * `givenCatalogueKnowsNothing` to leave the provider's own title in place.
 */
export const givenCatalogueDescribes = (materials: CatalogueMaterial[]) => {
  cy.interceptGraphql({
    operationName: "catalogueDetailsByIsbn",
    body: buildCatalogueDetailsResponse(materials)
  });
};

/** Given: the catalogue has no record of the materials being rendered. */
export const givenCatalogueKnowsNothing = () => givenCatalogueDescribes([]);
