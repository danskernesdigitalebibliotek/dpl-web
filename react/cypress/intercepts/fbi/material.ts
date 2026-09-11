import {
  buildGetMaterialResponse,
  materialFactory
} from "../../factories/material/material.factory";
import { onlineAudioBookManifestation } from "../../factories/manifestation/variants/onlineAudioBookManifestation";
import { fictionNonfictionNotSpecifiedMaterial } from "../../factories/material/variants/fictionNonfictionNotSpecifiedMaterial";
import { musicMaterial } from "../../factories/material/variants/musicMaterial";
import { nonFictionMaterial } from "../../factories/material/variants/nonFictionMaterial";
import { periodicalMaterial } from "../../factories/material/variants/periodicalMaterial";

export const givenAMaterial = () => {
  cy.interceptGraphql({
    operationName: "getMaterial",
    body: buildGetMaterialResponse()
  });
};

/**
 * Given: the default work, with a streamed audiobook edition added. Only an
 * online edition reaches the digital player, so this is what a test needs to
 * exercise the LYT button.
 */
export const givenAMaterialWithOnlineAudiobook = () => {
  const material = materialFactory.build();
  material.work?.manifestations.all.push(onlineAudioBookManifestation);

  cy.interceptGraphql({
    operationName: "getMaterial",
    body: buildGetMaterialResponse(material)
  });
};

export const givenAMaterialMusic = () => {
  cy.interceptGraphql({
    operationName: "getMaterial",
    body: buildGetMaterialResponse(musicMaterial)
  });
};

export const givenANonFictionMaterial = () => {
  cy.interceptGraphql({
    operationName: "getMaterial",
    body: buildGetMaterialResponse(nonFictionMaterial)
  });
};

export const givenAPeriodical = () => {
  cy.interceptGraphql({
    operationName: "getMaterial",
    body: buildGetMaterialResponse(periodicalMaterial)
  });
};

export const givenAFictionNonfictionNotSpecifiedMaterial = () => {
  cy.interceptGraphql({
    operationName: "getMaterial",
    body: buildGetMaterialResponse(fictionNonfictionNotSpecifiedMaterial)
  });
};
