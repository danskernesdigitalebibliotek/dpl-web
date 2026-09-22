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
      .should("be.visible")
      .scrollIntoView()
      .within(() => {
        cy.dataCy("video-bundle-slider").first().then(testMaterialNavigation)
      })
  })

  const testMaterialNavigation = (subject: JQuery<HTMLElement>) => {
    cy.wrap(subject).within(() => {
      cy.dataCy("work-card-title")
        .first()
        .should("be.visible")
        .should("contain.text", "Dette er titlen på en e-bog")

      cy.dataCy("video-bundle-next-button").filter(":visible").click()

      cy.dataCy("work-card-title")
        .first()
        .should("be.visible")
        .should("contain.text", "Dette er titlen på en lydbog")

      cy.dataCy("video-bundle-prev-button").filter(":visible").click()

      cy.dataCy("work-card-title")
        .first()
        .should("be.visible")
        .should("contain.text", "Dette er titlen på en e-bog")
    })
  }

  it("Should navigate materials in material slider", () => {
    // The page content is streamed inside a Suspense boundary. Until React reveals
    // it, the SSR markup sits in a hidden placeholder div at the end of <body>, and
    // scrolling to an element in there scrolls to position 0. Asserting visibility
    // first makes Cypress retry until the content is revealed and laid out.
    // Scrolling the skeleton into view is what triggers lazy loading of the real slider.
    cy.dataCy("material-slider-skeleton").first().should("be.visible").scrollIntoView()

    cy.dataCy("material-slider")
      .first()
      .should("be.visible")
      .within(() => {
        // Wait for data to load — the next button starts disabled and becomes
        // enabled once works are loaded and keen-slider updates.
        cy.dataCy("material-slider-next-button").should("not.be.disabled")

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
