import { Factory } from "fishery";
import {
  type CatalogueDetailsByIsbnQuery,
  IdentifierTypeEnum
} from "@danskernesdigitalebibliotek/dpl-service-layer/fbi/contract";

/**
 * Responses for `catalogueDetailsByIsbn` — the search the service layer runs
 * to name a digital material from the catalogue rather than from the provider
 * that lends it. Typed against the generated operation, so a body that drifts
 * from the contract fails to typecheck rather than quietly testing a response
 * FBI would never send.
 */

export type CatalogueMaterial = {
  isbn: string;
  title: string;
  authors?: string[];
};

type CatalogueWork =
  CatalogueDetailsByIsbnQuery["complexSearch"]["works"][number];

const workFactory = Factory.define<CatalogueWork, CatalogueMaterial>(
  ({ transientParams }) => {
    const { isbn = "", title = "", authors = [] } = transientParams;

    return {
      titles: { full: [title] },
      creators: authors.map((display) => ({ display })),
      manifestations: {
        all: [{ identifiers: [{ type: IdentifierTypeEnum.Isbn, value: isbn }] }]
      }
    };
  }
);

export const buildCatalogueDetailsResponse = (
  materials: CatalogueMaterial[]
): { data: CatalogueDetailsByIsbnQuery } => ({
  data: {
    complexSearch: {
      works: materials.map((material) =>
        workFactory.build({}, { transient: material })
      )
    }
  }
});
