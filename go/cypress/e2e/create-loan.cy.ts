import getV1UserLoansAdapterFactory, { loanFactory } from "../factories/ap/getV1UserLoansAdapter"
import complexSearchForWorkTeaser from "../factories/fbi/complexSearchForWorkTeaser"
import { worksWithIdentifiersFactory } from "../factories/fbi/factory-parts/works"
import getMaterial from "../factories/fbi/getMaterial"
import configuration from "../factories/unilogin/configuration"
import createloan from "../factories/unilogin/createloan"
import institution from "../factories/unilogin/institution"
import introspection from "../factories/unilogin/introspection"
import tokenSet from "../factories/unilogin/tokenSet"
import userinfo from "../factories/unilogin/userinfo"
import { mockFrontpage, mockUniloginProfilePage } from "../support/mocks"

describe("Create loan UI Tests", () => {
  beforeEach(() => {
    mockFrontpage()

    cy.visit("/")
  })

  it("Navigate to material page ", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      data: getMaterial.build(),
    })

    cy.visit("/work/work-of%3A870970-basis%3A136817027")
  })

  it("Navigate to loanable digital material and preview a loan", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      data: getMaterial.build(),
    })

    cy.visit("/work/work-of%3A870970-basis%3A136817027")

    // Click the second slide select option
    cy.get("[data-cy='slide-select-option']").eq(1).click()

    // Find the try ebook button using its text
    cy.contains("Prøv e-bog").click()

    // Check if user is on the ebook preview page
    cy.url().should("include", "/work/work-of%3A870970-basis%3A136817027/read")
  })

  // it.only("set session mock", () => {
  //   cy.setCookie(
  //     "go-session",
  //     "Fe26.2*1*2cf80d646d3e410c6769f6f8ddf39dcc3421757e2890aa58533b0aa84a7a03e9*50GAeNMES3a7WKAmBkz1SQ*DNO2YNUxhos60kVG9hOAjvgA7yyvSwB2hhCaSMYRVpflmdhu1giRje1L9d2LZlNtLlw4rV03c_yAXOIs-dpzWt56ilJORghrgvj2H40-ltYhTQTQWLoq6n2P-DKv98YAwMmko9Xe-2mZYrUzW7vkWtZ_NJXff3Msrb3fyEr1ETklH70uwA950hQ20mF1JSUeA7YTFHUvBbuGN4ZCDkNDJgPFOc4yELnI9nulp3xZaUeCHgIzmr080rQXiMsUh2-MBYGeZvmVkrTAG7ZVmHXJRXCOxkEbLGAqyl8cRfGg7Q9LZYJdKCsNOYa0-wpXhtLj4NblN5kX-72TA5_Fez1GEZyM9qJGTH-_EiEJPqZBmvnaZ68vh0nGz5MOnIqbnckmrgFSR8SZSIlNbYZF-A99T5mtnMrtklf2dFv_6ymQfODG-tTHvt9lDhhNqNr4vnrM0RkmpkxF6HQ6r-43zpFujauzalU9OkLMiaNXLKuvoyfx1bowtJ_KsXXR6mDJ2OFBW0ipM0P9vPs485Tyb37cW8hz1PvCfzTmXe_C_1ENQG5EwfLJwyOHu9m2ASI9aB0sEZ8DAlKVe8rkayaEVk7r0ixxMAuT4Abng3FcKa07gyzftMDRon4osfvKB68aPBo0L4MmTw6VOudgJOZiE8u158eh3HnkSAKscX0H208_1PYZshK7vpu9rgP6ikyDgX-s58xWTbLKMeR2tkktW-tcYaNYQS4z0CphB7v6x6eVfde6x8MkG8WoL24_gBuoWqPY3HBqfi-TcYrdR3FDXsN4k_I0nP0sbCGWfCVjz6fhR6oPZ5kFffp1ImYONrnGdKK6rkX6GOFGCKjS-hdMBwV4IoRFH19JU2SCsrMw87eRURZSn6IzRYN6KIPHHrIVjBytMkeKVXLpiOlJgYdW769myQhPGF0yWMFqF4zTF_eYAgi-IwsRj6YHYaiiiFqs7l5vwg6WXJWyO09OzSCCC1Z6hWz6HGkFRYl5txiGq-iUOflOcCxqtGU21OvnUSsVuu-JIx65drhCqHFQC3k81Q-3zdv5wnvILlT3_oSX5Gpi7I2B56tpsQP4CqX7c8a1z5suz4qYeO4J5BM2GDE4s9DLiuc4JM7PUDqlwkAk0xsMBYJJ3M8F-9k6rNpfry7o-hgyxIQWCUaNBwwd3L5D1zdpS53fhLWzLr-qcg3fwRfzYnksNVSbF2LcShEvaborJWhOyrANPeLcAwV__bnleNbIk0IlP4Sf2uJ7MdBm06s8pPISLUzp7q7KdfqgHvlew2MMpRAc9YC4uzk-5rmrn_xNvI8JdARD1fPG68Z_X-1lQM-iKrwF9emWj4NgXVe8LicppcYfilBS10wKZtidNaOri8GSsvoNFKuC0eB-mkx4jDZtoCDdpbq0x1U1zVYdrMEnpdT7ODL2cLq1uw1XcTQYheVZQLkbLu6N2ukkcaL7gkvFxPvGur_Aq9fT7abRn0wiHqQ9tQh8iHMRgrA2uem8z3it0_HjVmyc8fsy25RJv6o4Uqa6AvBcgQAKKTF2vrnZKOVkeDcBWVbll6BOWaY_mYtMhIy-s1ZZj_r7E70vEhmiVw7CDpu14bPz4YA77TTCP2Gbp9L10fQJfax1hiHBB84u6XmO3vca4qdEe5_zpoq07AlCtLQ6lutZtbuSs55ylrkVb8Rw4yYazR3sYRpzy3V4mD9nXfb52JbqRcQSBmnoISIcaybI78pMN8QWTqjqDZ2XRQ3bxN8y1cc5cmjwEsVcz4CBrcNf7BkJdtXZdK-8gCSIYLf-mWLTf_xVo6QglMtyuHtt7UUlZl03j2bOKtXOMGTfPzliqBPWm44G8J-7S9zLpfNcB4-CpZRaSjp840AzXWuDC2gK7UP_vDKhHYTCaGItg23F6-qYrK1Cqb48bFin4Tb85MwsOY2wHMPYe0fCcg3ocNBB9r4sfe-3Z3HVe9y5PRJoBRXXUKDur1H4kbFV-s003X_DoqqGMvveCEfx0hHlvyOI3JDkb2CcRWl0b0fYPbOOlLkdqpdX-RCn0qcbpGTlN4VtMZC-oSY2LocLcNBPNE8tKdltLCpWxPdWbmLdB9LhdbG9_tgNkkF-MuYESNvG5hZtGtz3w-4vPX3wqS_TeSBTgEypCtYZ1JOL5j2TZVFLpnCi3YMZ5EgEGzsMC9OOWeJIw909zV708SDkzMnAvggzaRpCaV05e4iTEB6m3rWxESXU76XB5IfXa7jwTIKpcPRHLqUmltVXYNtogQvSLafUb-TotmpQzcojgHC91lT1qp76c8JOFhvvlRqkHugFKWE13IDqriy3UD10CGOaF3itN1SShYNWjY46kzjuSK0InYflRlvq753XHwZptM4jUIhhg-uKptYnNJGRvu9KnKrbZuzTXSlu6yoGfbp1ngmM2p7nUnZdoK4StPY2lFNzzIt4ir2fytUq9FG_G_nyFwKwSovlhJow5cvrxCJrgw7FuPduXkD3uW2XX8YBe--c7cFb8gm_RxxYQNQiubt-Hc_AaIWRXZFr98zxDV1ESD4alKqVSmkue75rXqp6Rsy8tSzq12ZYs8-rwT5_U1qC18RtxiCngB8Uo2t52XTIIHLBYlpBIpG5Qb8yrF3kVbEgB4aj00PomM4opeD-VJTE34YE7u7K3ewi_ZWHK354wUfdhuGLEV1YJQWMgVO-yW316GcyeEInTAm3376K4lPJQYV2VvLI1bbG8EY1XL_DnpHl07SrISMzJy_BaDV2rCk6H3Ap14XBiHyu1T4eWQEbTCJ9dL4OpgEpEQHZjIg6ue-dS4cWB84FDk2P--kIK54PkJLALp_um-bH9cl1i4IcyfpyyLyhixgTOR0BiUZGe_-AwDxu14hzMGOiKAjybek2KT4Pn2TT_OLqhspN3J-PWtlrbJ7a2bMECFe6q9GuyVCb91WFMlsXMIzJ2w8qGMwQ1r_tf4NQ2BorZam33HdGmzhEfSCbmeO_IHs_Ws675-LErtZ9PqJoCxbQGsTyIC_WwodJuzor5zsi_l2q-FG32USbRF1o-zd27ZIo2PReRS9vDLgPBcsiwmBIpRsVPjskfCqFA9Ol5gVdlQadU_M3MDY0uoezWy5BvxrzGoLgnLsFgOYsAs--V62xY2qqqz_ff1SJpRaB51a9fsuh5tSMme1nLHqmnprQmGKybXHbsTKi3mc7s7Zyn9TmOfre7MJfGzZlPTKO_W4Ph5aAtZJSotbuJ3k4Sjv5xd-yDWbVsLkt0v9G54kLgSMsYixTNUXM5HDnY0sro3WsMj1-jUx68rzgSdrPoVhmwTBdLSWIIFfoD23tD2jh6FHD_Qr9cwWb5om4OsH3_J2Egi9FNSuMlIite8I6G7yVde1A19NMKHGsWpfb8zh3RBQp6sXGpIUMTTR5rstM0coi*1757337072431*eb07adb8673bd930785176dc177b83481f95c6fa219183905fee1526d08fac49*n7LtpDpNsQR82SMXX35eQfU7dTrU2WriGaKs-vG4JGw~2"
  //   )

  //   cy.visit("/user/profile")
  // })

  it.only("Navigate to loanable digital material and make a loan with unilogin user", () => {
    cy.interceptGraphql({
      operationName: "getMaterial",
      data: getMaterial.build(),
    })

    cy.visit("/work/work-of%3A870970-basis%3A136817027")

    // Click the second slide select option
    cy.get("[data-cy='slide-select-option']").eq(1).click()

    // Find the loan ebook button using its text
    cy.contains("Lån e-bog").click()

    const mockedCallbackUrl =
      "/auth/callback/unilogin?session_state=60cda845-402f-4085-b41d-3e4e773e04d4&code=3a6c3675-8ec8-472f-bcd5-9425be472d6d.60cda845-402f-4085-b41d-3e4e773e04d4.135f0ca5-6083-4b5c-9de6-d4a1b3f8d60c"

    cy.mockServerRest({
      method: "GET",
      path: "/.well-known/openid-configuration",
      data: configuration.build(),
    })

    cy.mockServerRest({
      method: "POST",
      path: "/token",
      data: tokenSet.build(),
    })

    cy.mockServerRest({
      method: "POST",
      path: "/introspect",
      data: introspection.build(),
    })

    cy.mockServerRest({
      method: "GET",
      path: "/userinfo",
      data: userinfo.build(),
    })

    cy.mockServerSoap({
      path: "/institution",
      data: institution,
    })

    cy.visit(mockedCallbackUrl)

    cy.intercept("GET", "/pubhub/v1/user/loans", {
      statusCode: 200,
      body: getV1UserLoansAdapterFactory.build({ loans: [] }),
      headers: { "content-type": "application/json" },
    })

    mockUniloginProfilePage()

    cy.dataCy("loan-slider-work").should("have.length", 0)

    cy.wait(1000)

    // Return to material page
    cy.visit("/work/work-of%3A800010-katalog%3A99122258315905763?type=EBOOKS")

    // Mock SOAP create loan call on unilogin client side
    cy.mockServerSoap({
      path: "/createloan",
      data: createloan,
    })

    cy.wait(1000)

    // Find the loan ebook button using its text
    cy.contains("Lån e-bog").click()

    // Approve the loan in the approve loan modal
    cy.get("[data-cy='approve-loan-button']").click()

    cy.intercept("GET", "/pubhub/v1/user/loans", {
      statusCode: 200,
      body: getV1UserLoansAdapterFactory.build({
        loans: [
          loanFactory.build({
            orderId: "757a22ed-cbc4-4659-a5a9-be39bfc2ba6c",
            libraryBook: {
              identifier: "9788711668016",
            },
          }),
        ],
      }),
      headers: { "content-type": "application/json" },
    })

    // Find the loan ebook button using its text
    cy.contains("Læs e-bog")

    const identifiers = ["9788711668016"]

    // Mock GraphQL response for complex search
    cy.interceptGraphql({
      operationName: "complexSearchForWorkTeaser",
      data: complexSearchForWorkTeaser.build({
        complexSearch: {
          hitcount: identifiers.length,
          works: worksWithIdentifiersFactory.transient({ identifiers }).build(),
        },
      }),
    })

    // Go to profile page
    cy.visit("/user/profile")

    // Assert that the loan slider contains the expected number of works
    cy.dataCy("loan-slider-work").should("have.length", 1).contains
  })
})
