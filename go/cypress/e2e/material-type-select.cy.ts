import getMaterial from "../factories/fbi/getMaterial"

describe("MaterialTypeSelect Tests", () => {
  beforeEach(() => {
    cy.expectError("Failed to fetch data from DPL CMS")

    cy.interceptGraphql({
      operationName: "getMaterial",
      data: getMaterial.build(),
    })

    cy.visit("/work/work-of%3A870970-basis%3A136817027")
  })

  it("Should render all material type options", () => {
    cy.dataCy("slide-select-option").should("have.length", 3)
    cy.dataCy("slide-select-option").eq(0).should("contain.text", "E-bog")
    cy.dataCy("slide-select-option").eq(1).should("contain.text", "Lydbog")
    cy.dataCy("slide-select-option").eq(2).should("contain.text", "Bog")
  })

  it("Should have the ebook option selected by default", () => {
    // The work page defaults to the ebook manifestation when available
    cy.dataCy("slide-select-option")
      .eq(0)
      .should("have.attr", "aria-label")
      .and("contain", "Nu viser materialet som")
  })

  it("Should navigate to correct URL when selecting a different material type", () => {
    // Click the E-bog option
    cy.dataCy("slide-select-option").eq(0).click()
    cy.url().should("include", "type=EBOOK")

    // Click the Lydbog option
    cy.dataCy("slide-select-option").eq(1).click()
    cy.url().should("include", "type=AUDIO_BOOK_ONLINE")
  })

  it("Should update aria-labels when selecting a different option", () => {
    // Click the E-bog option
    cy.dataCy("slide-select-option").eq(1).click()

    // The clicked option should now indicate it's the current selection
    cy.dataCy("slide-select-option")
      .eq(1)
      .should("have.attr", "aria-label")
      .and("contain", "Nu viser materialet som")

    // The previously selected option should indicate it can be switched to
    cy.dataCy("slide-select-option")
      .eq(0)
      .should("have.attr", "aria-label")
      .and("contain", "Skift til visning af")
  })
})
