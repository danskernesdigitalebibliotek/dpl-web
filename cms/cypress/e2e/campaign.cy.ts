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
        name: "creators",
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
      const campaign = getCampaignFromResponse(response);

      expect(campaign.title).to.eq(
        "Promote authors: H. P. Lovecraft and Stephen King"
      );
      expect(campaign.text).to.eq(
        "Promote authors: H. P. Lovecraft and Stephen King"
      );
      expect(campaign.url).to.eq(
        "https://example.com/promote-authors-h-p-lovecraft-and-stephen-king"
      );
    });
  });

  it("Select OR campaign when not all AND rules are met", () => {
    cy.api("POST", "/dpl_campaign/match", [
      {
        name: "creators",
        values: [
          {
            key: "Stephen King",
            term: "Stephen King",
            score: 1,
          },
        ],
      },
      {
        name: "mainLanguages",
        values: [
          {
            key: "Dansk",
            term: "Dansk",
            score: 1,
          },
        ],
      },
      {
        name: "materialTypes",
        values: [
          {
            key: "Bog",
            term: "Bog",
            score: 1,
          },
        ],
      },
    ]).then((response) => {
      const campaign = getCampaignFromResponse(response);

      expect(Object.keys(campaign).length).to.eq(4);
      expect(campaign).to.have.property("id");
      expect(campaign.title).to.eq(
        "Promote authors: H. P. Lovecraft and Stephen King"
      );
      expect(campaign.text).to.eq(
        "Promote authors: H. P. Lovecraft and Stephen King"
      );
      expect(campaign.url).to.eq(
        "https://example.com/promote-authors-h-p-lovecraft-and-stephen-king"
      );
    });
  });

  it("Select AND campaign that are more specific than OR campaigns", () => {
    cy.api("POST", "/dpl_campaign/match", [
      {
        name: "creators",
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
        name: "mainLanguages",
        values: [
          {
            key: "Dansk",
            term: "Dansk",
            score: 1,
          },
        ],
      },
      {
        name: "materialTypes",
        values: [
          {
            key: "Bog",
            term: "Bog",
            score: 1,
          },
        ],
      },
    ]).then((response) => {
      const campaign = getCampaignFromResponse(response);

      expect(Object.keys(campaign).length).to.eq(4);
      expect(campaign).to.have.property("id");
      expect(campaign.title).to.eq("Read books by J. K. Rowling");
      expect(campaign.text).to.eq("Read books by J. K. Rowling");
      expect(campaign.url).to.eq(
        "https://example.com/read-books-by-j-k-rowling"
      );
    });
  });

  it("Select campaigns by matching an 'AND campaign' with matching ranking", () => {
    cy.request("POST", "/dpl_campaign/match", [
      {
        name: "creators",
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
        name: "mainLanguages",
        values: [
          {
            key: "rankingTestAnd",
            term: "rankingTestAnd",
            score: 5,
          },
        ],
      },
      {
        name: "materialTypes",
        values: [
          {
            key: "rankingTestAnd",
            term: "rankingTestAnd",
            score: 5,
          },
        ],
      },
    ]).then((response) => {
      const campaign = getCampaignFromResponse(response);

      expect(Object.keys(campaign).length).to.eq(4);
      expect(campaign).to.have.property("id");
      expect(campaign.title).to.eq(
        "An AND campaign for testing ranking matching"
      );
      expect(campaign.text).to.eq(
        "An AND campaign for testing ranking matching"
      );
      expect(campaign.url).to.eq(
        "https://example.com/an-and-campaign-for-testing-ranking-matching"
      );
    });
  });

  it("Return NOT FOUND when ranking does not match ranking span in 'AND campaign'", () => {
    cy.api({
      url: "/dpl_campaign/match",
      method: "POST",
      failOnStatusCode: false,
      body: [
        {
          name: "creators",
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
          name: "mainLanguages",
          values: [
            {
              key: "rankingTestAnd",
              term: "rankingTestAnd",
              score: 5,
            },
          ],
        },
        {
          name: "materialTypes",
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

  it("returns data for editorial users", () => {
    cy.drupalLogin();
    cy.api("POST", "/dpl_campaign/match", [
      {
        name: "materialTypes",
        values: [
          {
            key: "Bog",
            term: "Bog",
            score: 1,
          },
        ],
      },
    ]).then((response) => {
      expect(response.status).to.eq(200);
    });
    cy.anonymousUser();
  });

  it("returns data for patron users", () => {
    cy.adgangsplatformenLogin({
      authorizationCode: "auth-code",
      userCPR: 1234567890,
      userGuid: "abcd-1234-efgh",
      accessToken: "some-token",
    });
    cy.api("POST", "/dpl_campaign/match", [
      {
        name: "materialTypes",
        values: [
          {
            key: "Bog",
            term: "Bog",
            score: 1,
          },
        ],
      },
    ]).then((response) => {
      expect(response.status).to.eq(200);
    });
    cy.anonymousUser();
  });

  before(() => {
    cy.drupalLogin();

    // Create campaigns.
    createAuthorCampaign();
    createCampaignBooksByJKRowling();
    createRankingAndCampaign();
    createRankingOrCampaign();

    cy.anonymousUser();
  });

  after(() => {
    cy.drupalLogin();

    // Delete campaigns.
    deleteCampaign(campaigns.authorCampaign);
    deleteCampaign(campaigns.booksByJKRowling);
    deleteCampaign(campaigns.rankingAndCampaign);
    deleteCampaign(campaigns.rankingOrCampaign);

    cy.anonymousUser();
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
      facet: "creators",
      term: "H. P. Lovecraft",
      maxValue: 1,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "creators",
      term: "Stephen King",
      maxValue: 2,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "materialTypes",
      term: "Bog",
      maxValue: 3,
    });
  });
};

const createCampaignBooksByJKRowling = () => {
  createCampaign(() => {
    createCampaignMainProperties(campaigns.booksByJKRowling, "AND");
    createCampaignRule(0, {
      facet: "creators",
      term: "J. K. Rowling",
      maxValue: 1,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "mainLanguages",
      term: "Dansk",
      maxValue: 2,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "materialTypes",
      term: "Bog",
      maxValue: 3,
    });
  });
};

const createRankingAndCampaign = () => {
  createCampaign(() => {
    createCampaignMainProperties(campaigns.rankingAndCampaign, "AND");
    createCampaignRule(0, {
      facet: "creators",
      term: "rankingTestAnd",
      maxValue: 3,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "mainLanguages",
      term: "rankingTestAnd",
      maxValue: 3,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "materialTypes",
      term: "rankingTestAnd",
      maxValue: 3,
    });
  });
};

const createRankingOrCampaign = () => {
  createCampaign(() => {
    createCampaignMainProperties(campaigns.rankingOrCampaign, "OR");
    createCampaignRule(0, {
      facet: "creators",
      term: "rankingTestOr",
      maxValue: 5,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "mainLanguages",
      term: "rankingTestOr",
      maxValue: 5,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "materialTypes",
      term: "rankingTestOr",
      maxValue: 5,
    });
  });
};

const createCampaign = (callback: () => void) => {
  cy.visit("/node/add/campaign");
  callback();
  cy.get('input[value="Save"]').click();
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
      cy.get(".ui-dialog .form-submit")
        .filter(":visible")
        .should("exist")
        .click();
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
  cy.get("#edit-field-campaign-text-0-value").type(name);
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

const getCampaignFromResponse = (response: {
  body: {
    data: {
      id: number;
      title: string;
      text: string;
      url: string;
    };
  };
}) => {
  return response.body.data;
};
