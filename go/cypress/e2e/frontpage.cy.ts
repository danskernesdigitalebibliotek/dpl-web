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

  it("Should navigate video bundle", () => {
    cy.dataCy("video-bundle")
      .first()
      .within(() => {
        cy.isViewport("mobile").then(isMobile => {
          if (isMobile) {
            cy.dataCy("video-bundle-slider").first().then(testMaterialNavigation)
          } else {
            cy.dataCy("video-bundle-slider").eq(1).then(testMaterialNavigation)
          }
        })
      })
  })

  const testMaterialNavigation = (subject: JQuery<HTMLElement>) => {
    cy.wrap(subject).within(() => {
      cy.dataCy("work-card-title")
        .first()
        .should("be.visible")
        .should("contain.text", "Dette er titlen på en e-bog")

      cy.dataCy("video-bundle-next-button").click()

      cy.dataCy("work-card-title")
        .eq(1)
        .should("be.visible")
        .should("contain.text", "Dette er titlen på en lydbog")

      cy.dataCy("video-bundle-prev-button").click()

      cy.dataCy("work-card-title")
        .first()
        .should("be.visible")
        .should("contain.text", "Dette er titlen på en e-bog")
    })
  }

  it("Should navigate materials in material slider", () => {
    cy.dataCy("material-slider")
      .first()
      .should("be.visible")
      .within(() => {
        // Verify that the material is visible
        cy.dataCy("work-card-title")
          .first()
          .should("be.visible")
          .should("contain.text", "Dette er titlen på en e-bog")

        // Maximum number of materials to click through
        const maxAttempts = 10

        // Click the button up to 10 times
        for (let i = 0; i < maxAttempts; i++) {
          cy.dataCy("material-slider-next-button")
            .should("exist")
            .then($button => {
              if (!$button.prop("disabled")) {
                cy.dataCy("material-slider-next-button").click({ force: true })
              }
            })
        }
        // Verify the button is finally disabled
        cy.dataCy("material-slider-next-button").should("exist").should("be.disabled")

        // Verify that the last material is visible
        cy.dataCy("work-card-title")
          .last()
          .should("be.visible")
          .should("contain.text", "Dette er titlen på en lydbog")
      })
  })

  it("Go to search page when submitting search", () => {
    cy.dataCy("search-input").should("exist").focus().type("harry potter{enter}")
    cy.url().should("include", "/search")
  })
})
