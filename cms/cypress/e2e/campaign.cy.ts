// The campaign types and titles.
const campaigns = {
  authorCampaign: "Promote authors: H. P. Lovecraft and Stephen King",
  booksByJKRowling: "Read books by J. K. Rowling",
  rankingAndCampaign: "An AND campaign for testing ranking matching",
  rankingOrCampaign: "An OR campaign for testing ranking matching",
} as const;

describe("Campaign creation and endpoint", () => {
  it("Select the expected campaign based on OR rules", () => {
    cy.api("POST", "/dpl_campaign/match", [
      {
        name: "type",
        values: [
          {
            key: "Bog",
            term: "Bog",
            score: 1,
          },
          {
            key: "E-bog",
            term: "E-bog",
            score: 1,
          },
        ],
      },
      {
        name: "creator",
        values: [
          {
            key: "Stephen King",
            term: "Stephen King",
            score: 1,
          },
          {
            key: "Suzanne Bjerrehuus",
            term: "Suzanne Bjerrehuus",
            score: 1,
          },
        ],
      },
    ]).then((response) => {
      expect(response.body).to.deep.equal({
        data: {
          text: "Promote authors: H. P. Lovecraft and Stephen King",
          url: "https://example.com/promote-authors-h-p-lovecraft-and-stephen-king",
        },
      });
    });
  });

  it("Select OR campaign when not all AND rules are met", () => {
    cy.api("POST", "/dpl_campaign/match", [
      {
        name: "creator",
        values: [
          {
            key: "Stephen King",
            term: "Stephen King",
            score: 1,
          },
        ],
      },
      {
        name: "language",
        values: [
          {
            key: "Dansk",
            term: "Dansk",
            score: 1,
          },
        ],
      },
      {
        name: "type",
        values: [
          {
            key: "Bog",
            term: "Bog",
            score: 1,
          },
        ],
      },
    ]).then((response) => {
      expect(response.body).to.deep.equal({
        data: {
          text: "Promote authors: H. P. Lovecraft and Stephen King",
          url: "https://example.com/promote-authors-h-p-lovecraft-and-stephen-king",
        },
      });
    });
  });

  it("Select AND campaign that are more specific than OR campaigns", () => {
    cy.api("POST", "/dpl_campaign/match", [
      {
        name: "creator",
        values: [
          {
            key: "J. K. Rowling",
            term: "J. K. Rowling",
            score: 1,
          },
          {
            key: "Stephen King",
            term: "Stephen King",
            score: 1,
          },
        ],
      },
      {
        name: "language",
        values: [
          {
            key: "Dansk",
            term: "Dansk",
            score: 1,
          },
        ],
      },
      {
        name: "type",
        values: [
          {
            key: "Bog",
            term: "Bog",
            score: 1,
          },
        ],
      },
    ]).then((response) => {
      cy.log(response.body);
      expect(response.body).to.deep.equal({
        data: {
          text: "Read books by J. K. Rowling",
          url: "https://example.com/read-books-by-j-k-rowling",
        },
      });
    });
  });

  it("Select campaigns by matching an 'AND campaign' with matching ranking", () => {
    cy.request("POST", "/dpl_campaign/match", [
      {
        name: "creator",
        values: [
          {
            key: "A",
            term: "A",
            score: 4,
          },
          {
            key: "B",
            term: "B",
            score: 3,
          },
          {
            key: "rankingTestAnd",
            term: "rankingTestAnd",
            // This score is supposed to give a ranking of 3
            // which is the max value of the rule and therefore a match:
            score: 2,
          },
          {
            key: "C",
            term: "C",
            score: 1,
          },
        ],
      },
      {
        name: "language",
        values: [
          {
            key: "rankingTestAnd",
            term: "rankingTestAnd",
            score: 5,
          },
        ],
      },
      {
        name: "type",
        values: [
          {
            key: "rankingTestAnd",
            term: "rankingTestAnd",
            score: 5,
          },
        ],
      },
    ]).then((response) => {
      cy.log(response.body);
      expect(response.body).to.deep.equal({
        data: {
          text: "An AND campaign for testing ranking matching",
          url: "https://example.com/an-and-campaign-for-testing-ranking-matching",
        },
      });
    });
  });

  it("Return NOT FOUND when ranking does not match ranking span in 'AND campaign'", () => {
    cy.api({
      url: "/dpl_campaign/match",
      method: "POST",
      failOnStatusCode: false,
      body: [
        {
          name: "creator",
          values: [
            {
              key: "A",
              term: "A",
              score: 6,
            },
            {
              key: "B",
              term: "B",
              score: 5,
            },
            {
              key: "C",
              term: "C",
              score: 4,
            },
            {
              key: "D",
              term: "D",
              score: 3,
            },
            {
              key: "E",
              term: "E",
              score: 2,
            },
            {
              key: "rankingTestAnd",
              term: "rankingTestAnd",
              // This is supposed to be outside of the ranking span.
              score: 1,
            },
          ],
        },
        {
          name: "language",
          values: [
            {
              key: "rankingTestAnd",
              term: "rankingTestAnd",
              score: 5,
            },
          ],
        },
        {
          name: "type",
          values: [
            {
              key: "rankingTestAnd",
              term: "rankingTestAnd",
              score: 5,
            },
          ],
        },
      ],
    })
      .its("status")
      .should("equal", 404);
  });

  before(() => {
    // Login as admin.
    cy.clearCookies();
    cy.drupalLogin();

    // Create campaigns.
    createAuthorCampaign();
    createCampaignBooksByJKRowling();
    createRankingAndCampaign();
    createRankingOrCampaign();

    // Logout (obviously).
    cy.drupalLogout();
  });

  after(() => {
    // Login as admin.
    cy.clearCookies();
    cy.drupalLogin();

    // Delete campaigns.
    deleteCampaign(campaigns.authorCampaign);
    deleteCampaign(campaigns.booksByJKRowling);
    deleteCampaign(campaigns.rankingAndCampaign);
    deleteCampaign(campaigns.rankingOrCampaign);

    // Logout (obviously).
    cy.drupalLogout();
  });

  beforeEach(() => {
    Cypress.Cookies.debug(true);
  });
  afterEach(() => {
    Cypress.Cookies.debug(false);
  });
});

const createAuthorCampaign = () => {
  createCampaign(() => {
    createCampaignMainProperties(campaigns.authorCampaign, "OR");
    createCampaignRule(0, {
      facet: "creator",
      term: "H. P. Lovecraft",
      maxValue: 1,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "creator",
      term: "Stephen King",
      maxValue: 2,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "type",
      term: "Bog",
      maxValue: 3,
    });
  });
};

const createCampaignBooksByJKRowling = () => {
  createCampaign(() => {
    createCampaignMainProperties(campaigns.booksByJKRowling, "AND");
    createCampaignRule(0, {
      facet: "creator",
      term: "J. K. Rowling",
      maxValue: 1,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "language",
      term: "Dansk",
      maxValue: 2,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "type",
      term: "Bog",
      maxValue: 3,
    });
  });
};

const createRankingAndCampaign = () => {
  createCampaign(() => {
    createCampaignMainProperties(campaigns.rankingAndCampaign, "AND");
    createCampaignRule(0, {
      facet: "creator",
      term: "rankingTestAnd",
      maxValue: 3,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "language",
      term: "rankingTestAnd",
      maxValue: 3,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "type",
      term: "rankingTestAnd",
      maxValue: 3,
    });
  });
};

const createRankingOrCampaign = () => {
  createCampaign(() => {
    createCampaignMainProperties(campaigns.rankingOrCampaign, "OR");
    createCampaignRule(0, {
      facet: "creator",
      term: "rankingTestOr",
      maxValue: 5,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "language",
      term: "rankingTestOr",
      maxValue: 5,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "type",
      term: "rankingTestOr",
      maxValue: 5,
    });
  });
};

const createCampaign = (callback: () => void) => {
  cy.visit("/node/add/campaign");
  callback();
  cy.get("#edit-submit").click();
};

const deleteCampaign = (title: string) => {
  cy.visit("/admin/content");
  cy.contains(title)
    .parents("tr")
    .find("td li.dropbutton-toggle button")
    .click()
    .then(($button) => {
      cy.wrap($button)
        .parent(".dropbutton-toggle")
        .parent("ul.dropbutton")
        .find("li.delete a")
        .click();
      cy.get("#edit-submit").should("exist").click();
    });
};

const createCampaignMainProperties = (name: string, logic: "AND" | "OR") => {
  const campaignUri = name
    .replace(/ /g, "-")
    .replace(/[.:]/g, "")
    .toLowerCase();

  cy.get("#edit-title-0-value").type(name);
  cy.get("#edit-field-campaign-link-0-uri").type(
    `https://example.com/${campaignUri}`
  );
  cy.get("#edit-body-0-value").type(name);
  cy.get("#edit-field-campaign-rules-logic").select(logic);
};
const createCampaignRule = (
  index: number,
  { facet, term, maxValue }: { facet: string; term: string; maxValue: number }
) => {
  cy.get(`select[id*="-${index}-subform-field-campaign-rule-facet"]`).select(
    facet
  );
  cy.get(
    `input[id*="-${index}-subform-field-campaign-rule-term-0-value"]`
  ).type(term);
  cy.get(
    `input[id*="-${index}-subform-field-campaign-rule-ranking-max-0-value"]`
  ).type(maxValue.toString());
};
