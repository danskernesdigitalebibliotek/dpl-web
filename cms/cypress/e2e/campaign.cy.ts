describe("Campaign creation and endpoint", () => {
  it("Select the expected campaign based on OR rules", () => {
    cy.request("POST", "/dpl_campaign/match", [
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
    cy.request("POST", "/dpl_campaign/match", [
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
    cy.request("POST", "/dpl_campaign/match", [
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

  before(() => {
    // Login as admin.
    cy.clearCookies();
    cy.drupalLogin();

    // Create campaigns.
    createAuthorCampaign();
    createCampaignBooksByJKRowling();
    createAndCampaignWithLowMaxValues();
    createAndCampaignWithHighMaxValues();

    // Logout (obviously).
    cy.drupalLogout();
  });

  beforeEach(() => {
    Cypress.Cookies.debug(true);
    cy.resetRequests();
  });

  afterEach(() => {
    cy.logRequests();
    Cypress.Cookies.debug(false);
  });
});

const createAuthorCampaign = () => {
  createCampaign(() => {
    createCampaignMainProperties(
      "Promote authors: H. P. Lovecraft and Stephen King",
      "OR"
    );
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
    createCampaignMainProperties("Read books by J. K. Rowling", "AND");
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

const createAndCampaignWithLowMaxValues = () => {
  createCampaign(() => {
    createCampaignMainProperties("And campaign with low max values", "AND");
    createCampaignRule(0, {
      facet: "creator",
      term: "lowMaxValue",
      maxValue: 1,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "language",
      term: "lowMaxValue",
      maxValue: 1,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "type",
      term: "lowMaxValue",
      maxValue: 1,
    });
  });
};

const createAndCampaignWithHighMaxValues = () => {
  createCampaign(() => {
    createCampaignMainProperties("And campaign with high max values", "AND");
    createCampaignRule(0, {
      facet: "creator",
      term: "highMaxValue",
      maxValue: 10,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "language",
      term: "highMaxValue",
      maxValue: 10,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "type",
      term: "highMaxValue",
      maxValue: 10,
    });
  });
};

const createCampaign = (callback: () => void) => {
  cy.visit("/node/add/campaign");
  callback();
  cy.get("#edit-submit").click();
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
