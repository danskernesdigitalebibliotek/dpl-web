import { FictionNonfictionCodeEnum } from "../../../../src/core/dbc-gateway/generated/graphql";
import { manifestationFactory } from "../../manifestation/manifestation.factory";
import { materialFactory } from "../material.factory";

const fictionNonfiction = {
  display: "Vides ikke",
  code: FictionNonfictionCodeEnum.NotSpecified
};

const notSpecifiedManifestation = manifestationFactory.build({
  fictionNonfiction
});

export const fictionNonfictionNotSpecifiedMaterial = materialFactory.build({
  work: {
    fictionNonfiction,
    manifestations: {
      all: [notSpecifiedManifestation],
      latest: notSpecifiedManifestation,
      bestRepresentation: notSpecifiedManifestation
    }
  }
});
