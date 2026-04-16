const campaigns = {
  orFacetsOnly: 'OR campaign with facets only',
  orPhrasesOnly: 'OR campaign with phrases only',
  orMixed: 'OR campaign with facets and phrases',
  andMixed: 'AND campaign with facets and phrases',
  highWeight: 'High weight campaign',
  lowWeight: 'Low weight campaign',
} as const;

type PostBody = {
  facets?: {
    name: string;
    values: { key: string; term: string; score: number }[];
  }[];
  queries?: { text: string }[];
};

const postMatch = (body: PostBody) => {
  return cy.api({
    url: '/dpl_campaign/match',
    method: 'POST',
    body,
    failOnStatusCode: false,
  });
};

const expectCampaign = (
  response: Cypress.Response<{ data: { title: string } }>,
  title: string,
) => {
  expect(response.status).to.eq(200);
  expect(response.body.data.title).to.eq(title);
};

const expect404 = (response: Cypress.Response<null>) => {
  expect(response.status).to.eq(404);
};

// -- Campaign creation helpers --

const createCampaign = (callback: () => void) => {
  cy.visit('/node/add/campaign');
  callback();
  cy.clickSaveButton();
};

const fillCampaignFields = (
  name: string,
  logic: 'AND' | 'OR',
  weight: number = 80,
) => {
  const campaignUri = name
    .replace(/ /g, '-')
    .replace(/[.:]/g, '')
    .toLowerCase();

  cy.get('#edit-title-0-value').type(name);
  cy.get('#edit-field-campaign-link-0-uri').type(
    `https://example.com/${campaignUri}`,
  );
  cy.get('#edit-field-campaign-text-0-value').type(name);
  cy.get('#edit-field-campaign-rules-logic').select(logic);
  cy.get('#edit-field-campaign-weight').select(weight.toString());
};

const addFacetTrigger = (
  index: number,
  { facet, term, maxValue }: { facet: string; term: string; maxValue: number },
) => {
  cy.get('[id^=field-campaign-rules-campaign-rule-add-more]').click();
  cy.get(`select[id*="-${index}-subform-field-campaign-rule-facet"]`).select(
    facet,
  );
  cy.get(
    `input[id*="-${index}-subform-field-campaign-rule-term-0-value"]`,
  ).type(term);
  cy.get(
    `input[id*="-${index}-subform-field-campaign-rule-ranking-max-0-value"]`,
  ).type(maxValue.toString());
};

const addPhraseTrigger = (index: number, phrase: string) => {
  cy.get('[id^=field-campaign-rules-campaign-trigger-query-add-more]').click();
  cy.get(
    `input[id*="-${index}-subform-field-campaign-trigger-phrase-0-value"]`,
  ).type(phrase);
};

// -- Campaign factories --

const createOrFacetsOnly = () => {
  createCampaign(() => {
    fillCampaignFields(campaigns.orFacetsOnly, 'OR');
    addFacetTrigger(0, {
      facet: 'creators',
      term: 'Stephen King',
      maxValue: 5,
    });
    addFacetTrigger(1, { facet: 'materialTypes', term: 'Bog', maxValue: 5 });
  });
};

const createOrPhrasesOnly = () => {
  createCampaign(() => {
    fillCampaignFields(campaigns.orPhrasesOnly, 'OR');
    addPhraseTrigger(0, 'krimi');
    addPhraseTrigger(1, 'spænding');
  });
};

const createOrMixed = () => {
  createCampaign(() => {
    fillCampaignFields(campaigns.orMixed, 'OR');
    addFacetTrigger(0, {
      facet: 'creators',
      term: 'H. P. Lovecraft',
      maxValue: 5,
    });
    addPhraseTrigger(1, 'horror');
  });
};

const createAndMixed = () => {
  createCampaign(() => {
    fillCampaignFields(campaigns.andMixed, 'AND');
    addFacetTrigger(0, {
      facet: 'creators',
      term: 'J. K. Rowling',
      maxValue: 3,
    });
    addPhraseTrigger(1, 'harry potter');
    addPhraseTrigger(2, 'potter');
  });
};

const createHighWeight = () => {
  createCampaign(() => {
    // Weight 100 = Highest
    fillCampaignFields(campaigns.highWeight, 'OR', 100);
    addFacetTrigger(0, {
      facet: 'subjects',
      term: 'weight-test',
      maxValue: 99,
    });
  });
};

const createLowWeight = () => {
  createCampaign(() => {
    // Weight 70 = Low
    fillCampaignFields(campaigns.lowWeight, 'OR', 70);
    addFacetTrigger(0, {
      facet: 'subjects',
      term: 'weight-test',
      maxValue: 99,
    });
  });
};

describe('Campaign v2: facet + phrase triggers', () => {
  before(() => {
    cy.drupalLogin();
    createOrFacetsOnly();
    createOrPhrasesOnly();
    createOrMixed();
    createAndMixed();
    createHighWeight();
    createLowWeight();
    cy.anonymousUser();
  });

  after(() => {
    cy.drupalLogin('/admin/content?type=campaign');

    Object.values(campaigns).forEach((title) => {
      cy.get('.views-field-title').contains(title).parent().parent().as('row');
      cy.log('@row');
      cy.get('@row')
        .find('.views-field-node-bulk-form input')
        // We need to force it, as Cypress gets confused about the floating footer.
        .click({ force: true });
    });

    cy.get('#edit-bulk-actions-container').as('bulkForm');

    cy.get('@bulkForm').find('select#edit-action').select('node_delete_action');
    cy.get('@bulkForm').find('.form-submit').click();
    cy.get('[data-drupal-selector="edit-actions"]')
      .find('.form-submit')
      .click();
    cy.anonymousUser();
  });

  // -- OR logic --

  describe('OR logic', () => {
    it('matches a campaign with facets only', () => {
      postMatch({
        facets: [
          {
            name: 'creators',
            values: [{ key: 'Stephen King', term: 'Stephen King', score: 1 }],
          },
        ],
      }).then((response) => {
        expectCampaign(response, campaigns.orFacetsOnly);
      });
    });

    it('matches a campaign with query phrases only', () => {
      postMatch({
        queries: [{ text: 'krimi' }],
      }).then((response) => {
        expectCampaign(response, campaigns.orPhrasesOnly);
      });
    });

    it('matches an OR campaign when only the facet trigger matches', () => {
      postMatch({
        facets: [
          {
            name: 'creators',
            values: [
              { key: 'H. P. Lovecraft', term: 'H. P. Lovecraft', score: 1 },
            ],
          },
        ],
      }).then((response) => {
        expectCampaign(response, campaigns.orMixed);
      });
    });

    it('matches an OR campaign when only the phrase trigger matches', () => {
      postMatch({
        queries: [{ text: 'horror' }],
      }).then((response) => {
        expectCampaign(response, campaigns.orMixed);
      });
    });

    it('returns 404 when nothing matches', () => {
      postMatch({
        facets: [
          {
            name: 'creators',
            values: [
              {
                key: 'nonexistent author',
                term: 'nonexistent author',
                score: 1,
              },
            ],
          },
        ],
        queries: [{ text: 'some text that matches nothing' }],
      }).then((response) => {
        expect404(response);
      });
    });
  });

  // -- AND logic --

  describe('AND logic', () => {
    it('matches when ALL triggers are satisfied', () => {
      postMatch({
        facets: [
          {
            name: 'creators',
            values: [{ key: 'J. K. Rowling', term: 'J. K. Rowling', score: 1 }],
          },
        ],
        queries: [{ text: 'harry potter' }],
      }).then((response) => {
        expectCampaign(response, campaigns.andMixed);
      });
    });

    it('returns 404 when only the facet trigger matches', () => {
      postMatch({
        facets: [
          {
            name: 'creators',
            values: [{ key: 'J. K. Rowling', term: 'J. K. Rowling', score: 1 }],
          },
        ],
        queries: [{ text: 'totally unrelated' }],
      }).then((response) => {
        expect404(response);
      });
    });

    it('returns 404 when only the phrase trigger matches', () => {
      postMatch({
        facets: [
          {
            name: 'creators',
            values: [
              { key: 'Unknown Author', term: 'Unknown Author', score: 1 },
            ],
          },
        ],
        queries: [{ text: 'harry potter' }],
      }).then((response) => {
        expect404(response);
      });
    });
  });

  // -- Substring / fuzzy matching --

  describe('Substring matching on phrases', () => {
    it('matches when the trigger phrase is a substring of the user query', () => {
      postMatch({
        queries: [{ text: 'danske krimi-noveller' }],
      }).then((response) => {
        expectCampaign(response, campaigns.orPhrasesOnly);
      });
    });

    it('matches case-insensitively', () => {
      postMatch({
        queries: [{ text: 'KRIMI' }],
      }).then((response) => {
        expectCampaign(response, campaigns.orPhrasesOnly);
      });
    });

    it('does not match when user query is shorter than trigger phrase', () => {
      // Trigger phrase is "spænding", user sends just "spæ".
      postMatch({
        queries: [{ text: 'spæ' }],
      }).then((response) => {
        expect404(response);
      });
    });
  });

  // -- Weight priority --

  describe('Weight priority', () => {
    it('returns the higher-weighted campaign when both match', () => {
      postMatch({
        facets: [
          {
            name: 'subjects',
            values: [{ key: 'weight-test', term: 'weight-test', score: 1 }],
          },
        ],
      }).then((response) => {
        expectCampaign(response, campaigns.highWeight);
      });
    });
  });
});
