import { PageObject, Elements } from "@hammzj/cypress-page-object";

export const dashboardStory = {
  default: "primary",
  withBiblioAdapter: "dashboard-with-biblio-adapter"
} as const;

export class DashboardPage extends PageObject {
  public elements!: Elements;

  constructor(story: string = dashboardStory.default) {
    super({
      path: `/iframe.html?path=/story/apps-dashboard--${story}`
    });

    this.elements = {
      loansNotOverdue: () => cy.get("[data-cy='loans-not-overdue']"),
      loansSoonOverdue: () => cy.get("[data-cy='physical-loans-soon-overdue']")
    };
  }
}
