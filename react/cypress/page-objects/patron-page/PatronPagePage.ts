import { PageObject } from "@hammzj/cypress-page-object";

/**
 * The patron page stories. `withBiblioAdapter` is the same app with the CMS
 * feature flag turned on, where the support identifier and the loan quotas
 * come from the adapter instead of Publizon.
 *
 * The page exposes no elements of its own: what the specs assert - the support
 * identifier and the quota numbers - is plain text a user reads, so they match
 * on the text rather than on a class the markup happens to use today.
 */
export const patronPageStory = {
  default: "patron-page-entry",
  withBiblioAdapter: "patron-page-with-biblio-adapter"
} as const;

export class PatronPagePage extends PageObject {
  constructor(story: string = patronPageStory.default) {
    super({
      path: `/iframe.html?path=/story/apps-patron-page--${story}`
    });
  }
}
