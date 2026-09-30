import getV1LibraryProfileAdapterFactory from "../factories/ap/getV1LibraryProfileAdapter"
import getV1ProductsIdentifierAdapterFactory from "../factories/ap/getV1ProductsIdentifierAdapter"
import getV1UserLoansAdapterFactory from "../factories/ap/getV1UserLoansAdapter"
import GetAdgangsplatformenLibraryToken from "../factories/dpl-cms/getAdgangsplatformenLibraryToken"
import GetCategories from "../factories/dpl-cms/getCategories"
import GetDplCmsPrivateConfiguration from "../factories/dpl-cms/getDplCmsPrivateConfiguration"
import GetDplCmsPublicConfiguration from "../factories/dpl-cms/getDplCmsPublicConfiguration"
import GoFrontpage from "../factories/dpl-cms/getPageByPathQuery/go-frontpage"
import ComplexSearchForWorkTeaser from "../factories/fbi/complexSearchForWorkTeaser"
import { identifierFactory } from "../factories/fbi/factory-parts/identifier"
import { worksWithIdentifiersFactory } from "../factories/fbi/factory-parts/works"

// The CMS configuration is cached server-side for 15 minutes, and the root
// layout reads it on every page. A render that happened before these mocks
// were registered caches a config without the Adgangsplatformen login url,
// which leaves the login button disabled for the rest of the run.
// Dropping the tag here means each test starts from a config built on its
// own mocks.
export const revalidateConfigCache = () => {
  const secret = Cypress.env("DRUPAL_REVALIDATE_SECRET")
  if (!secret) {
    throw new Error(
      "DRUPAL_REVALIDATE_SECRET is missing, so the config cache cannot be revalidated " +
        "and every test would inherit whatever config was cached first."
    )
  }

  // Not failOnStatusCode: false - a 401 or 400 means the cache was not
  // cleared, which is the flakiness this exists to prevent.
  cy.request({
    url: "/cache/revalidate",
    qs: {
      tags: "dpl-cms-public-config,dpl-cms-private-config",
      secret,
    },
  })
}

export const mockConfig = () => {
  cy.mockServerGraphQLQuery({
    operationName: "getAdgangsplatformenLibraryToken",
    data: GetAdgangsplatformenLibraryToken.build(),
  })

  cy.mockServerGraphQLQuery({
    operationName: "getDplCmsPublicConfiguration",
    data: GetDplCmsPublicConfiguration.transient({
      appUrl: Cypress.env("DPL_GO_BASE_URL"),
    }).build(),
  })

  cy.mockServerGraphQLQuery({
    operationName: "getDplCmsPrivateConfiguration",
    data: GetDplCmsPrivateConfiguration.build(),
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

  cy.intercept("GET", "/ap-service/pubhub-adapter/v1/products/*", reg => {
    // Intercept the request and respond with a mocked product
    const id = reg.url.split("/").pop() // Get the last part of the URL which is the product ID

    reg.reply({
      statusCode: 200,
      body: getV1ProductsIdentifierAdapterFactory.build({
        product: { externalProductId: { id }, costFree: true },
      }),
      headers: { "content-type": "application/json" },
    })
  })
}

export const mockAPProfilePage = () => {
  cy.intercept("GET", "/pubhub/v1/library/profile", {
    statusCode: 200,
    body: getV1LibraryProfileAdapterFactory.build(),
    headers: { "content-type": "application/json" },
  })

  const identifiers = identifierFactory.buildList(9)

  cy.intercept("GET", "/ap-service/pubhub-adapter/v1/user/loans", {
    statusCode: 200,
    body: getV1UserLoansAdapterFactory.transient({ identifiers }).build(),
    headers: { "content-type": "application/json" },
  })

  cy.interceptGraphql({
    operationName: "complexSearchForWorkTeaser",
    data: ComplexSearchForWorkTeaser.build({
      complexSearch: {
        hitcount: identifiers.length,
        works: worksWithIdentifiersFactory.transient({ identifiers }).build(),
      },
    }),
  })

  cy.intercept("GET", "/ap-service/pubhub-adapter/v1/products/*", reg => {
    // Intercept the request and respond with a mocked product
    const id = reg.url.split("/").pop() // Get the last part of the URL which is the product ID

    reg.reply({
      statusCode: 200,
      body: getV1ProductsIdentifierAdapterFactory.build({
        product: { externalProductId: { id }, costFree: true },
      }),
      headers: { "content-type": "application/json" },
    })
  })
}

export const mockUniloginProfilePage = () => {
  cy.intercept("GET", "/pubhub/v1/library/profile", {
    statusCode: 200,
    body: getV1LibraryProfileAdapterFactory.build(),
    headers: { "content-type": "application/json" },
  })

  const identifiers = identifierFactory.buildList(9)

  cy.intercept("GET", "/pubhub/v1/user/loans", {
    statusCode: 200,
    body: getV1UserLoansAdapterFactory.transient({ identifiers }).build(),
    headers: { "content-type": "application/json" },
  })

  cy.interceptGraphql({
    operationName: "complexSearchForWorkTeaser",
    data: ComplexSearchForWorkTeaser.build({
      complexSearch: {
        hitcount: identifiers.length,
        works: worksWithIdentifiersFactory.transient({ identifiers }).build(),
      },
    }),
  })

  cy.intercept("GET", "/ap-service/pubhub-adapter/v1/products/*", reg => {
    // Intercept the request and respond with a mocked product
    const id = reg.url.split("/").pop() // Get the last part of the URL which is the product ID

    reg.reply({
      statusCode: 200,
      body: getV1ProductsIdentifierAdapterFactory.build({
        product: { externalProductId: { id }, costFree: true },
      }),
      headers: { "content-type": "application/json" },
    })
  })
}
