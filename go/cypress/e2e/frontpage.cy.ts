import { mockFrontpage } from "../support/mocks"

describe("Front Page Tests", () => {
  beforeEach(() => {
    mockFrontpage()
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
      .scrollIntoView()
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
        .first()
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
    // Since we are swapping between skeleton and real content with lazy loading,
    // we need to ensure the skeleton is visible first because that triggers the loading of the real content.
    cy.dataCy("material-slider-skeleton").first().scrollIntoView()

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
        const maxAttempts = 20

        // Click the button up to 20 times
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
