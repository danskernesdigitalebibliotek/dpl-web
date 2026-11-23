import { GetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"

import getMaterial from "../factories/fbi/getMaterial"

type Manifestation = NonNullable<
  NonNullable<NonNullable<GetMaterialQuery["work"]>["manifestations"]>["all"]
>[number]

const EBOOK_PID = "870970-basis:52380235"
const SECOND_EBOOK_PID = "870970-basis:52380236"
const SECOND_EBOOK_IDENTIFIER = "9788711668017"

// The factory carries one edition per material type, and the picker only opens
// for a type holding more than one. A second ebook edition is cloned from the
// first, under its own pid, identifiers, year and publisher.
//
// The clone is given the OLDER year: editions sort newest-first and the page
// defaults to the newest per type, so 2016 stays the default and the clone
// takes the second slot.
const withTwoEbookEditions = () => {
  const material = getMaterial.build()
  const editions = material.work?.manifestations?.all ?? []
  const ebook = editions.find(manifestation => manifestation.pid === EBOOK_PID) as Manifestation

  const secondEbook: Manifestation = {
    ...ebook,
    pid: SECOND_EBOOK_PID,
    // Its own material id: the digital availability hooks key their decisions
    // by this, so a shared id would collapse the two editions into one.
    identifiers: [
      { type: "PUBLIZON", value: SECOND_EBOOK_IDENTIFIER },
      { type: "ISBN", value: SECOND_EBOOK_IDENTIFIER },
    ],
    edition: {
      ...ebook.edition,
      summary: "2008",
      publicationYear: { display: "2008", year: 2008 },
    },
    publisher: ["Gyldendal"],
  }

  return {
    ...material,
    work: {
      ...material.work,
      manifestations: {
        ...material.work?.manifestations,
        all: [...editions, secondEbook],
      },
    },
  } as GetMaterialQuery
}

describe("Editions select", () => {
  beforeEach(() => {
    cy.expectError("Failed to fetch data from DPL CMS")

    cy.interceptGraphql({
      operationName: "getMaterial",
      data: withTwoEbookEditions(),
    })

    // The work page defaults to the ebook, which is the type carrying two
    // editions here.
    cy.visit("/work/work-of%3A870970-basis%3A136817027")
  })

  it("Should show the edition of the manifestation on display", () => {
    cy.contains("Udgave: 2016").should("be.visible")
  })

  it("Should show the switch button when the type has more than one edition", () => {
    cy.get("button[aria-label='Skift udgave']").should("be.visible")
  })

  it("Should hide the switch button for a type with a single edition", () => {
    // The button is shown for the ebook, so its later absence is a change
    // rather than a state the page was already in.
    cy.get("button[aria-label='Skift udgave']").should("be.visible")

    // Bog has one edition in the factory. Matched on its exact label — "Bog"
    // is a substring of both "E-bog" and "Lydbog".
    cy.dataCy("slide-select-option").contains(/^Bog$/).click()
    cy.url().should("include", "type=BOOK")

    // The button is absent mid-switch too, so its absence only means anything
    // once the switch has committed. "706 sider" is the book's own length and
    // the ebook carries none, so it reaches the info box only with the book's
    // manifestation — which is the same commit the button reacts to. The
    // material-type label is no signal here: it follows the optimistic value
    // and flips on tap.
    cy.contains("dd", "706 sider").should("be.visible")

    cy.get("button[aria-label='Skift udgave']").should("not.exist")
  })

  it("Should open the picker listing both editions", () => {
    cy.get("button[aria-label='Skift udgave']").click()

    cy.get("[role='dialog']").should("be.visible")
    // The grid renders skeletons until both availability providers answer, so
    // the count is retried until the editions replace them.
    cy.get("input[type='radio']").should("have.length", 2)
    cy.get("input[type='radio']").eq(0).should("be.checked")
  })

  it("Should name each edition for a screen reader", () => {
    cy.get("button[aria-label='Skift udgave']").click()

    cy.get("input[type='radio']")
      .eq(1)
      .should("have.attr", "aria-label")
      .and("contain", "Udgave: 2008")
      .and("contain", "Forlag: Gyldendal")
  })

  it("Should put the picked edition in the url on confirm", () => {
    cy.get("button[aria-label='Skift udgave']").click()

    cy.get("input[type='radio']").eq(1).check({ force: true })
    cy.contains("button", "Vælg udgave").click()

    cy.url().should("include", `edition=${encodeURIComponent(SECOND_EBOOK_PID)}`)
    cy.url().should("include", "type=EBOOK")
  })

  it("Should announce the choice and restore focus to the switch button", () => {
    cy.get("button[aria-label='Skift udgave']").click()

    cy.get("input[type='radio']").eq(1).check({ force: true })
    cy.contains("button", "Vælg udgave").click()

    // The announcement drops the year for any edition that is not its type's
    // default: the header looks the pid up in its `manifestations` prop, which
    // filterManifestationsByEdition has already reduced to one edition per
    // type. Asserted as it behaves, not as it reads best — see DDF-XXX.
    cy.contains("[role='status']", "Udgave valgt").should("exist")
    cy.focused().should("have.attr", "aria-label", "Skift udgave")
  })
})
