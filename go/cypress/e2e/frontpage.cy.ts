import GetCategories from "../factories/dpl-cms/getCategories"
import GoFrontpage from "../factories/dpl-cms/getPageByPathQuery/go-frontpage"
import ComplexSearchForWorkTeaser from "../factories/fbi/complexSearchForWorkTeaser"

describe("Front Page Tests", () => {
  beforeEach(() => {
    cy.mockServerGraphQLQuery({
      operationName: "getPageByPath",
      data: GoFrontpage.build(),
    })

    cy.mockServerGraphQLQuery({
      operationName: "getCategories",
      data: GetCategories.build(),
    })

    cy.interceptGraphql({
      operationName: "complexSearchForWorkTeaser",
      data: ComplexSearchForWorkTeaser.build(),
    })

    cy.visit("/")
  })

  it("Should include a header and a footer", () => {
    cy.get("header").should("exist")
    cy.get("footer").should("exist")
    cy.dataCy("go-logo").should("exist")
  })

  it.only("Should navigate video bundle", () => {
    cy.dataCy("video-bundle")
      .first()
      .within(() => {
        // Verify that the first material is visible
        cy.dataCy("work-card-title")
          .first()
          .should("be.visible")
          .should("contain.text", "Dette er titlen på en e-bog")

        // Click button to navigate to next material
        cy.dataCy("video-bundle-next-button").click()

        // Verify that the next material is visible
        cy.dataCy("work-card-title")
          .eq(1)
          .should("be.visible")
          .should("contain.text", "Dette er titlen på en lydbog")

        // Click button to navigate to previous material
        cy.dataCy("video-bundle-prev-button").click()

        // Verify that the previous material is visible
        cy.dataCy("work-card-title")
          .first()
          .should("be.visible")
          .should("contain.text", "Dette er titlen på en e-bog")
      })
  })
})
