describe("Campaign creation and endpoint", () => {
  it("Select the expected campaign based on OR rules", () => {
    //.
  });

  before(() => {
    // Login and create four campaigns. Two with OR and two with AND.
    cy.clearCookies();
    cy.drupalLogin();

    // Create campaign 1 with OR trigger rules:
    createCampaignOne();
    // Create campaign 2 with OR trigger rules:
    createCampaignTwo();
    // Create campaign 3 with AND trigger rules:
    createCampaignThree();
    // Create campaign 4 with AND trigger rules:
    createCampaignFour();
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

const createCampaignOne = () => {
  createCampaign(() => {
    createCampaignMainProperties("Read some more Harry Potter", "OR");
    createCampaignRule(0, {
      facet: "creator",
      term: "J. K. Rowling",
      maxValue: 3,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "language",
      term: "Dansk",
      maxValue: 3,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "type",
      term: "Bog",
      maxValue: 3,
    });
  });
};

const createCampaignTwo = () => {
  createCampaign(() => {
    createCampaignMainProperties("Read some more Stephen King", "OR");
    createCampaignRule(0, {
      facet: "creator",
      term: "Stephen King",
      maxValue: 3,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "language",
      term: "Dansk",
      maxValue: 3,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "type",
      term: "Bog",
      maxValue: 3,
    });
  });
};

const createCampaignThree = () => {
  createCampaign(() => {
    createCampaignMainProperties("Read some more L. Ron Hubbard", "AND");
    createCampaignRule(0, {
      facet: "creator",
      term: "L. Ron Hubbard",
      maxValue: 3,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "language",
      term: "Dansk",
      maxValue: 3,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "type",
      term: "Bog",
      maxValue: 3,
    });
  });
};

const createCampaignFour = () => {
  createCampaign(() => {
    createCampaignMainProperties("Read some more H. P. Lovecraft", "AND");
    createCampaignRule(0, {
      facet: "creator",
      term: "H. P. Lovecraft",
      maxValue: 3,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(1, {
      facet: "language",
      term: "Dansk",
      maxValue: 3,
    });
    cy.get("[id^=field-campaign-rules-campaign-rule-add-more]").click();
    createCampaignRule(2, {
      facet: "type",
      term: "Bog",
      maxValue: 3,
    });
  });
};

const createCampaign = (callback: () => void) => {
  cy.visit("/node/add/campaign");
  callback();
  cy.get("#edit-submit").click();
};

const createCampaignMainProperties = (name: string, logic: "AND" | "OR") => {
  const campaignUri = name.replace(/ /g, "-").replace(/\./g, "").toLowerCase();

  cy.get("#edit-title-0-value").type(name);
  cy.get("#edit-field-campaign-link-0-uri").type(
    `https://example.com/${campaignUri}`
  );
  cy.get("#edit-body-0-value").type(`${name} body`);
  cy.get("#edit-field-campaign-rules-logic").type(logic);
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
