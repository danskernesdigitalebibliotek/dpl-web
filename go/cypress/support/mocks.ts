import coverService from "../factories/covers/coverService"
import GetAdgangsplatformenLibraryToken from "../factories/dpl-cms/getAdgangsplatformenLibraryToken"
import GetCategories from "../factories/dpl-cms/getCategories"
import GetDplCmsPrivateConfiguration from "../factories/dpl-cms/getDplCmsPrivateConfiguration"
import GetDplCmsPublicConfiguration from "../factories/dpl-cms/getDplCmsPublicConfiguration"
import GoFrontpage from "../factories/dpl-cms/getPageByPathQuery/go-frontpage"
import ComplexSearchForWorkTeaser from "../factories/fbi/complexSearchForWorkTeaser"

export const mockConfig = () => {
  cy.mockServerGraphQLQuery({
    operationName: "getAdgangsplatformenLibraryToken",
    data: GetAdgangsplatformenLibraryToken.build(),
  })

  cy.mockServerGraphQLQuery({
    operationName: "getDplCmsPublicConfiguration",
    data: GetDplCmsPublicConfiguration.transient({
      appUrl: Cypress.env("NEXT_PUBLIC_APP_URL"),
    }).build(),
  })

  cy.mockServerGraphQLQuery({
    operationName: "getDplCmsPrivateConfiguration",
    data: GetDplCmsPrivateConfiguration.build(),
  })
}

export const mockCovers = () => {
  cy.interceptCovers({
    covers: coverService.build(),
  })
}

export const mockFrontpage = () => {
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
}
