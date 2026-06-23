import { Factory } from "fishery";
import { ManifestationBasicDetailsFragment } from "../../../src/core/dbc-gateway/generated/graphql";

/**
 * Factory for the `ManifestationBasicDetails` GraphQL fragment used by the
 * loan list (and other small surfaces) to resolve manifestation content via
 * `getManifestationViaMaterialByFaust`.
 */
export const manifestationBasicDetailsFactory =
  Factory.define<ManifestationBasicDetailsFragment>(() => ({
    __typename: "Manifestation",
    pid: "870970-basis:46985591",
    abstract: ["Mock manifestation abstract"],
    ownerWork: {
      __typename: "Work",
      workId: "work-of:870970-basis:46985591"
    },
    titles: {
      __typename: "ManifestationTitles",
      full: ["Harry Potter"]
    },
    materialTypes: [
      {
        __typename: "MaterialType",
        materialTypeSpecific: {
          __typename: "SpecificMaterialType",
          display: "bog"
        }
      }
    ],
    creators: [],
    edition: {
      __typename: "Edition",
      publicationYear: {
        __typename: "PublicationYear",
        display: "2019"
      }
    },
    series: [],
    languages: {
      __typename: "Languages",
      main: [
        {
          __typename: "Language",
          display: "engelsk",
          iso639Set1: "en"
        }
      ]
    }
  }));
