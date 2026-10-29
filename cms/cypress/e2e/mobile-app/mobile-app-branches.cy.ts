// The mobile apps list the library's branches, with their contact info and
// where they can be used, from getBranches, which the BFF behind them reads.
// A failure here means a change in the CMS will break the mobile apps.
import { pickBranchAddress } from '../../helpers/helper-branch';
import { ignoreLinkitUriError } from '../../helpers/helper-linkit';
import { gqlQueries } from '../../helpers/mobile-app-queries';

type AvailabilityContext = 'search' | 'availability' | 'reservations';

type Branch = {
  isilId: string;
  title: string;
  address: {
    street: string | null;
    postalCode: string | null;
    city: string | null;
    country: string | null;
  } | null;
  phone: string | null;
  email: string | null;
  availabilityContext: Record<AvailabilityContext, boolean>;
};

type BranchesVariables = {
  isilId?: string;
  availabilityContexts?: AvailabilityContext[];
  cmsConfigured?: boolean;
};

// A branch from the FBS branches mock (wiremock). It is used by no branch node
// in the default content, so we are free to map one to it and exclude it.
const isilId = 'FBS-751030';
// Matches every title the tests give branch nodes, so cleaning up also removes
// nodes left behind by an earlier run.
const nodeTitlePrefix = 'test-mobile-app-branch';

const formUrl = '/admin/config/dpl-library-agency/general-settings';
// The exclusion checkboxes in the form are named after the purpose, which for
// reservations is singular.
const exclusionField = (context: AvailabilityContext) =>
  `[name="${context === 'reservations' ? 'reservation' : context}[${isilId}]"]`;
const contexts: AvailabilityContext[] = [
  'search',
  'availability',
  'reservations',
];

const getBranches = (variables: BranchesVariables = {}) =>
  cy
    .queryMobileAppGraphql<{ getBranches: Branch[] }>(
      gqlQueries.GET_BRANCHES,
      variables,
    )
    .then(({ data }) => data.getBranches);

// The branch the tests change, alone, as the query is filtered on it.
const getTestBranch = (variables: Omit<BranchesVariables, 'isilId'> = {}) =>
  getBranches({ ...variables, isilId });

const saveForm = () => {
  cy.get('[value="Save configuration"]').first().click();
  cy.contains('The configuration options have been saved.');
};

const setExcluded = (excluded: Record<AvailabilityContext, boolean>) => {
  cy.drupalLogin(formUrl);
  contexts.forEach((context) => {
    if (excluded[context]) {
      cy.get(exclusionField(context)).check();
    } else {
      cy.get(exclusionField(context)).uncheck();
    }
  });
  saveForm();
};

const fillBranchForm = (title: string, phone: string, email: string) => {
  cy.get('#edit-title-0-value').clear();
  cy.get('#edit-title-0-value').type(title);
  cy.get('.meta-sidebar__trigger').click();
  cy.get('[name="field_email[0][value]"]').clear();
  cy.get('[name="field_email[0][value]"]').type(email);
  cy.get('[name="field_phone[0][value]"]').clear();
  cy.get('[name="field_phone[0][value]"]').type(phone);
  cy.get('.meta-sidebar__close').click();
};

// A branch with a node shows up when asking for CMS-configured branches, and
// not when asking for the others. Without a node it is the other way around.
const assertTestBranch = (expected: Branch, cmsConfigured: boolean) => {
  getTestBranch().then((branches) => {
    expect(branches).to.deep.equal([expected]);
  });
  getTestBranch({ cmsConfigured }).then((branches) => {
    expect(branches).to.deep.equal([expected]);
  });
  getTestBranch({ cmsConfigured: !cmsConfigured }).then((branches) => {
    expect(branches).to.deep.equal([]);
  });
};

ignoreLinkitUriError();

describe('Mobile app API: getBranches', () => {
  const original: Record<AvailabilityContext, boolean> = {
    search: false,
    availability: false,
    reservations: false,
  };

  // The tests start from a branch that is excluded nowhere.
  before(() => {
    cy.drupalLogin(formUrl);
    contexts.forEach((context) => {
      cy.get(exclusionField(context)).then(($field) => {
        original[context] = $field.prop('checked');
      });
    });
    setExcluded({ search: false, availability: false, reservations: false });
  });

  after(() => {
    cy.deleteEntitiesIfExists(nodeTitlePrefix);
    setExcluded(original);
  });

  // The response before the test changes anything: the branch as it comes
  // from FBS, with no node. The tests assert on the whole response, so a
  // change must leave the rest of it as it was.
  let unchanged: Branch;
  beforeEach(() => {
    cy.deleteEntitiesIfExists(nodeTitlePrefix);
    getTestBranch().then((branches) => {
      expect(branches).to.have.length(1);
      unchanged = branches[0];
      expect(unchanged).to.deep.equal({
        isilId,
        title: 'ITK',
        address: null,
        phone: null,
        email: null,
        availabilityContext: {
          search: true,
          availability: true,
          reservations: true,
        },
      });
    });
  });

  it('returns every branch in the expected shape', () => {
    getBranches().then((branches) => {
      expect(branches).to.have.length.greaterThan(0);
      branches.forEach((branch) => {
        expect(branch.isilId).to.be.a('string');
        expect(branch.title).to.be.a('string');
        if (branch.address !== null) {
          Object.values(branch.address).forEach((value) => {
            expect(value).to.satisfy(
              (v: unknown) => v === null || typeof v === 'string',
            );
          });
        }
        [branch.phone, branch.email].forEach((value) => {
          expect(value).to.satisfy(
            (v: unknown) => v === null || typeof v === 'string',
          );
        });
        contexts.forEach((context) => {
          expect(branch.availabilityContext[context]).to.be.a('boolean');
        });
      });
    });
  });

  it('reflects create, update and delete of a branch node', () => {
    // Titles unique to the run, so leftovers from an earlier run cannot make
    // the test pass.
    const runId = Date.now();
    const title = `${nodeTitlePrefix} ${runId}`;
    const updatedTitle = `${nodeTitlePrefix} updated ${runId}`;

    assertTestBranch(unchanged, false);

    cy.drupalLogin('/node/add/branch');
    fillBranchForm(title, '11 11 11 11', 'info+before@reload.dk');
    // We use the Ishøj address, as it's one of the "strange" addresses that
    // only show up as a house number (husnummer) in the address register.
    pickBranchAddress({
      search: 'Ishøj Store Torv 1 2635',
      option: 'Ishøj Store Torv 1, 2635 Ishøj',
    });
    // The select2 widget is synced from the underlying select on submit.
    cy.get('select[name="field_agency_branch_id"]').select(isilId, {
      force: true,
    });
    cy.clickSaveButton();
    cy.get('.hero').contains(title).should('be.visible');

    assertTestBranch(
      {
        ...unchanged,
        title,
        address: {
          street: 'Ishøj Store Torv 1',
          postalCode: '2635',
          city: 'Ishøj',
          country: 'DK',
        },
        phone: '11 11 11 11',
        email: 'info+before@reload.dk',
      },
      true,
    );

    cy.get('link[rel="shortlink"]')
      .invoke('attr', 'href')
      .then((nodePath) => {
        cy.visit(`${nodePath}/edit`);
      });
    fillBranchForm(updatedTitle, '22 22 22 22', 'info+after@reload.dk');
    // An address with a floor, so the floor must make it into the street.
    pickBranchAddress({
      search: 'Dronningensgade 53',
      option: 'Dronningensgade 53, 1., 1420 København K',
      houseNumber: 'Dronningensgade 53, 1420 København K',
    });
    cy.clickSaveButton();
    cy.get('.hero').contains(updatedTitle).should('be.visible');

    assertTestBranch(
      {
        ...unchanged,
        title: updatedTitle,
        address: {
          street: 'Dronningensgade 53, 1.',
          postalCode: '1420',
          city: 'København K',
          country: 'DK',
        },
        phone: '22 22 22 22',
        email: 'info+after@reload.dk',
      },
      true,
    );

    cy.deleteEntitiesIfExists(nodeTitlePrefix);

    assertTestBranch(unchanged, false);
  });

  contexts.forEach((context) => {
    it(`reflects excluding the branch from ${context}`, () => {
      const otherContexts = contexts.filter((other) => other !== context);

      setExcluded({
        search: false,
        availability: false,
        reservations: false,
        [context]: true,
      });

      const excluded = {
        ...unchanged,
        availabilityContext: {
          ...unchanged.availabilityContext,
          [context]: false,
        },
      };
      getTestBranch().then((branches) => {
        expect(branches).to.deep.equal([excluded]);
      });
      getTestBranch({ availabilityContexts: [context] }).then((branches) => {
        expect(branches).to.deep.equal([]);
      });
      getTestBranch({ availabilityContexts: otherContexts }).then(
        (branches) => {
          expect(branches).to.deep.equal([excluded]);
        },
      );

      setExcluded({ search: false, availability: false, reservations: false });

      getTestBranch().then((branches) => {
        expect(branches).to.deep.equal([unchanged]);
      });
      getTestBranch({ availabilityContexts: [context] }).then((branches) => {
        expect(branches).to.deep.equal([unchanged]);
      });
    });
  });
});
