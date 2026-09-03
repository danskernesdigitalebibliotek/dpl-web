import { PageObject, Elements } from "@hammzj/cypress-page-object";

/**
 * The patron page stories. `withBiblioAdapter` is the same app with the CMS
 * feature flag turned on, where the support identifier and the loan quotas
 * come from the adapter instead of Publizon.
 */
export const patronPageStory = {
  default: "patron-page-entry",
  withBiblioAdapter: "patron-page-with-biblio-adapter"
} as const;

export class PatronPagePage extends PageObject {
  public elements!: Elements;

  constructor(story: string = patronPageStory.default) {
    super({
      path: `/iframe.html?path=/story/apps-patron-page--${story}`
    });

    this.elements = {
      // The whole "Status" block, which only renders once quotas are known.
      statusSection: () => cy.get(".dpl-status-loans"),
      quotaLabels: () => cy.get(".dpl-progress-bar__header .text-label"),
      quotaBars: () => cy.get(".dpl-progress-bar__progress-bar div"),
      patronDetails: () => cy.get(".dpl-patron-info__text")
    };
  }
}
