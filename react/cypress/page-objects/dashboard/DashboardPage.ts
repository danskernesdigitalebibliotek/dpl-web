import { PageObject, Elements } from "@hammzj/cypress-page-object";
import { RecommendationSliderComponent } from "./components/RecommendationSlider";

export const dashboardStory = {
  default: "primary",
  withBiblioAdapter: "dashboard-with-biblio-adapter"
} as const;

export class DashboardPage extends PageObject {
  declare public elements: Elements;

  constructor(story: string = dashboardStory.default) {
    super({
      path: `/iframe.html?path=/story/apps-dashboard--${story}`
    });

    this.elements = {
      loansNotOverdue: () => cy.get("[data-cy='loans-not-overdue']"),
      loansSoonOverdue: () => cy.get("[data-cy='physical-loans-soon-overdue']"),
      recommendationSliders: () => cy.get("[data-cy='material-slider']")
    };
  }

  recommendationSlider(caption: string) {
    return new RecommendationSliderComponent(caption);
  }
}
