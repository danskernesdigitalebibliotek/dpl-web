import { manifestationFactory } from "../manifestation.factory";
import {
  AccessTypeCodeEnum,
  IdentifierTypeEnum
} from "../../../../src/core/dbc-gateway/generated/graphql";

/**
 * A streamed audiobook edition - "lydbog (online)" with Ereol access.
 *
 * Distinct from `audioBookManifestation`, which is the physical cd-mp3: only
 * an online edition reaches the digital player, so this is what a test needs
 * to exercise the LYT button on the material page.
 */
export const onlineAudioBookManifestation = manifestationFactory.build({
  pid: "870970-basis:140969517",

  source: ["eReolen"],

  titles: {
    main: ["De syv søstre (online)"],
    original: ["The seven sisters"]
  },

  materialTypes: [
    {
      materialTypeSpecific: {
        display: "lydbog (online)"
      }
    }
  ],

  identifiers: [
    {
      type: IdentifierTypeEnum.Isbn,
      value: "9788763850637"
    }
  ],

  edition: {
    summary: "2025 (lydbogsudgave)",
    publicationYear: {
      display: "2025"
    }
  },
  dateFirstEdition: null,

  physicalDescription: null,

  accessTypes: [
    {
      code: AccessTypeCodeEnum.Online
    }
  ],
  access: [
    {
      __typename: "Ereol",
      origin: "eReolen",
      url: "https://ereolen.dk/ting/object/870970-basis:140969517",
      canAlwaysBeLoaned: false
    }
  ],

  catalogueCodes: {
    nationalBibliography: ["DBF202529"],
    otherCatalogues: ["ACC202525", "ERE202529", "BKM202529"]
  }
});
