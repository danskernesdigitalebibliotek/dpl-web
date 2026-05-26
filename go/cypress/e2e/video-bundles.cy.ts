import { Interception } from "node_modules/cypress/types/net-stubbing"

import { mockFrontpage } from "../support/mocks"
import { hasOperationName } from "../support/utils"

describe("Video Bundle Tests", () => {
  beforeEach(() => {
    cy.expectError("Failed to fetch data from DPL CMS")
  })

  // Lazy-loaded paragraphs use a 1200px IntersectionObserver margin and their
  // skeletons don't render the <h2>. Scrolling to the bottom with a finite
  // duration ensures every bundle crosses the margin before we assert on titles.
  const activateAllParagraphs = () => {
    cy.scrollTo("bottom", { duration: 2000 })
    cy.scrollTo("top")
  }

  const scopeToBundle = (title: string) =>
    cy.contains("h2", title).closest(".bg-background-overlay")

  describe("Rendering and carousel navigation", () => {
    beforeEach(() => {
      mockFrontpage()
      cy.visit("/")
      activateAllParagraphs()
    })

    const variants = [
      {
        name: "horizontal Automatic",
        title: "Lit Gaming",
        iframeSrcIncludes: "media.videotool.dk",
        thumbnailIncludes: "thumbnail.jpg",
        vertical: false,
      },
      {
        name: "horizontal Manual",
        title: "Adrian løser læsekrisen!",
        iframeSrcIncludes: "media.videotool.dk",
        thumbnailIncludes: "thumbnail.jpg",
        vertical: false,
      },
      {
        name: "vertical Automatic",
        title: "Vertical auto bundle",
        iframeSrcIncludes: "vertical_auto_test_fixture",
        thumbnailIncludes: "vertical-auto-thumbnail",
        vertical: true,
      },
      {
        name: "vertical Manual",
        title: "Vertical manual bundle",
        iframeSrcIncludes: "vertical_manual_test_fixture",
        thumbnailIncludes: "vertical-manual-thumbnail",
        vertical: true,
      },
    ] as const

    variants.forEach(({ name, title, iframeSrcIncludes, thumbnailIncludes, vertical }) => {
      it(`Should render the ${name} bundle with title, video, thumbnail, and carousel`, () => {
        scopeToBundle(title)
          .scrollIntoView()
          .within(() => {
            cy.contains("h2", title).should("be.visible")
            if (vertical) {
              cy.get("[class*='aspect-9/16']").should("exist")
            }
            cy.get("iframe").should("have.attr", "src").and("include", iframeSrcIncludes)
            cy.get("img[aria-hidden='true']")
              .should("have.attr", "src")
              .and("include", thumbnailIncludes)
            cy.dataCy("video-bundle-slider").should("exist")
          })
      })
    })

    const navVariants = [
      { layout: "horizontal", title: "Lit Gaming" },
      { layout: "vertical", title: "Vertical auto bundle" },
    ] as const

    navVariants.forEach(({ layout, title }) => {
      it(`Should navigate the ${layout} bundle carousel via prev/next buttons`, () => {
        scopeToBundle(title)
          .scrollIntoView()
          .within(() => {
            cy.dataCy("work-card-title")
              .first()
              .should("contain.text", "Dette er titlen på en e-bog")

            cy.dataCy("video-bundle-next-button").filter(":visible").click()

            cy.dataCy("work-card-title")
              .first()
              .should("contain.text", "Dette er titlen på en lydbog")

            cy.dataCy("video-bundle-prev-button").filter(":visible").click()

            cy.dataCy("work-card-title")
              .first()
              .should("contain.text", "Dette er titlen på en e-bog")
          })
      })
    })
  })

  describe("Data loading", () => {
    it("Should show skeletons while works are loading and replace them with the iframe", () => {
      mockFrontpage()
      cy.intercept("POST", /(ap-service|graphql)/, req => {
        if (hasOperationName(req, "complexSearchForWorkTeaser")) {
          req.on("response", res => {
            res.setDelay(1500)
          })
        }
      })
      cy.visit("/")
      cy.get("[class*='animate-pulse']").should("exist")
      cy.get("iframe").should("have.attr", "src").and("include", "media.videotool.dk")
    })

    it("Should request works using the CQL value of the vertical Automatic bundle", () => {
      mockFrontpage()
      cy.intercept("POST", /(ap-service|graphql)/).as("graphqlRequests")
      cy.visit("/")
      cy.scrollTo("bottom", { duration: 1500 })
      cy.scrollTo("top")
      scopeToBundle("Vertical auto bundle").find("iframe").should("exist")
      cy.get<Interception[]>("@graphqlRequests.all").then(requests => {
        const matched = requests.find(r =>
          (r.request.body?.variables?.cql as string | undefined)?.includes("vertical-auto-test")
        )
        expect(
          Boolean(matched),
          "complexSearchForWorkTeaser was called with the bundle's CQL"
        ).to.equal(true)
      })
    })
  })
})
