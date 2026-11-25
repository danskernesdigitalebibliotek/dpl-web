import ComplexSearchForBookQuizFactory from "../factories/fbi/complexSearchForBookQuiz"

describe("Book Quiz Tests", () => {
  beforeEach(() => {
    // Ignore fetch errors from DPL CMS
    cy.expectError("Failed to fetch data from DPL CMS")
    cy.interceptGraphql({
      operationName: "complexSearchForBookQuiz",
      data: ComplexSearchForBookQuizFactory.build(),
    })
  })

  it("Should show a fallback without answers", () => {
    cy.visit("/bog-quiz")

    cy.get("h1").should("contain.text", "Vi mangler dine svar")
    cy.dataCy("book-quiz-section").should("not.exist")
  })

  it("Should take the quiz and show the books", () => {
    cy.visit("/bog-quiz")
    cy.dataCy("open-book-quiz-button").click()

    cy.dataCy("book-quiz-modal").within(() => {
      cy.dataCy("book-quiz-start-button").click()

      // Next is disabled until an option is selected
      cy.dataCy("book-quiz-next-button").should("be.disabled")

      // Genre: "Ride på en enhjørning"
      cy.dataCy("book-quiz-option").contains("Ride på en enhjørning").click()
      cy.dataCy("book-quiz-option")
        .contains("Ride på en enhjørning")
        .closest("button")
        .should("have.attr", "aria-pressed", "true")
      cy.dataCy("book-quiz-next-button").click()

      // Mood: "Et godt grin"
      cy.dataCy("book-quiz-option").contains("Et godt grin").click()
      cy.dataCy("book-quiz-next-button").click()

      // Skip subjects, age and level
      cy.dataCy("book-quiz-skip-button").click()
      cy.dataCy("book-quiz-skip-button").click()
      cy.dataCy("book-quiz-skip-button").click()
    })

    cy.location("search").should("contain", "genre=genre-fantasy").and("contain", "mood=mood-funny")
    cy.dataCy("book-quiz-modal").should("not.exist")
    cy.get("h1").should("contain.text", "Fantasy").and("contain.text", "Sjov")
    // One section per combination of the two answers, with at most 4 books
    // each
    cy.dataCy("book-quiz-section").should("have.length", 3)
    cy.dataCy("work-card").should("have.length.at.least", 3)
  })
})
