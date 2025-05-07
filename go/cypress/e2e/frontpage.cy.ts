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
    cy.visit("/")

    cy.get("header").should("exist")
    cy.get("footer").should("exist")
    cy.dataCy("go-logo").should("exist")
  })
})
