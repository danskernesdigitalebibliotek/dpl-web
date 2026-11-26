import { ComponentObject, Elements } from "@hammzj/cypress-page-object";

/**
 * A recommendation slider on the dashboard, found by its caption, e.g.
 * "Because you borrowed".
 */
export class RecommendationSliderComponent extends ComponentObject {
  declare public elements: Elements;

  constructor(caption: string) {
    super(() =>
      cy
        .contains("[data-cy='material-slider-caption']", caption)
        .closest("[data-cy='material-slider']")
    );
    this.addElements = {
      caption: () =>
        this.container().find("[data-cy='material-slider-caption']"),
      title: () => this.container().find("[data-cy='material-slider-title']"),
      // The recommended works' titles, each linking to its material page.
      works: () => this.container().find("[data-cy='recommended-description']")
    };
  }

  /** The material type the first work links to, from its `type` parameter. */
  firstWorkMaterialType() {
    return this.elements
      .works()
      .first()
      .invoke("attr", "href")
      .then((href) => new URL(String(href)).searchParams.get("type"));
  }
}
