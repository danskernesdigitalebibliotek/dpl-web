import { manifestationBasicDetailsFactory } from "../../factories/fbi/manifestationBasicDetails.factory";
import { ManifestationBasicDetailsFragment } from "../../../src/core/dbc-gateway/generated/graphql";

/**
 * Given: FBI resolves `getManifestationViaMaterialByFaust` with the supplied
 * (or default) manifestation. The loan list calls this query for every
 * physical loan to render title/author/year on the row.
 */
export const givenManifestationByFaust = (
  overrides?: Partial<ManifestationBasicDetailsFragment>
) => {
  cy.interceptGraphql({
    operationName: "getManifestationViaMaterialByFaust",
    body: {
      data: {
        manifestation: manifestationBasicDetailsFactory.build(overrides)
      }
    }
  });
};
