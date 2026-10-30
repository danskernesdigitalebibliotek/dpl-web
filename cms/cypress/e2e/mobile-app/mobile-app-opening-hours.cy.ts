// The mobile apps show the opening hours of the library's branches from the
// /api/v1/opening_hours REST endpoint, which the BFF behind them reads. A
// failure here means a change in the CMS will break the mobile apps.

type OpeningHours = {
  id: number;
  category: { title: string; color: string };
  date: string;
  start_time: string;
  end_time: string;
  branch_id: number;
  branch_name: string;
  branch_isil_id?: string;
  repetition: {
    id: number;
    type: 'none' | 'weekly';
    weekly_data?: { end_date: string };
  };
};

type OpeningHoursRequest = Omit<
  OpeningHours,
  'id' | 'branch_name' | 'branch_isil_id' | 'category' | 'repetition'
> & {
  id?: number;
  category: { title: string; color?: string };
  repetition: Omit<OpeningHours['repetition'], 'id'> & { id?: number };
};

type OpeningHoursQuery = {
  branch_id?: number;
  from_date?: string;
  to_date?: string;
};

// A branch from the FBS branches mock (wiremock). It is used by no branch node
// in the default content, nor by the getBranches spec.
const isilId = 'FBS-751031';
// Matches every title the tests give branch nodes, so cleaning up also removes
// nodes left behind by an earlier run.
const nodeTitlePrefix = 'test-mobile-app-opening-hours';
const category = 'Åbent';

// The BFF reads opening hours as an anonymous user.
const getOpeningHours = (query: OpeningHoursQuery) => {
  cy.clearCookies();
  return cy
    .request({
      url: '/api/v1/opening_hours',
      qs: { _format: 'json', ...query },
    })
    .then((response) => {
      expect(response.status).to.equal(200);
      return response.body as OpeningHours[];
    });
};

// Editors change opening hours through the opening hours editor, which sends
// these requests.
const editOpeningHours = (
  method: 'POST' | 'PATCH',
  body: OpeningHoursRequest,
) => {
  cy.drupalLogin();
  return cy
    .request({
      method,
      url: `/api/v1/opening_hours${body.id ? `/${body.id}` : ''}`,
      qs: { _format: 'json' },
      body,
    })
    .then((response) => {
      expect(response.status).to.equal(200);
      return response.body as OpeningHours[];
    });
};

const deleteOpeningHours = (id: number, repetitionId?: number) => {
  cy.drupalLogin();
  cy.request({
    method: 'DELETE',
    url: `/api/v1/opening_hours/${id}`,
    qs: {
      _format: 'json',
      ...(repetitionId ? { repetition_id: repetitionId } : {}),
    },
  })
    .its('status')
    .should('equal', 204);
};

const createBranch = (title: string) => {
  cy.drupalLogin('/node/add/branch');
  cy.get('#edit-title-0-value').type(title);
  // The select2 widget is synced from the underlying select on submit.
  cy.get('select[name="field_agency_branch_id"]').select(isilId, {
    force: true,
  });
  cy.clickSaveButton();
  cy.get('.hero').contains(title).should('be.visible');
  return cy
    .get('link[rel="shortlink"]')
    .invoke('attr', 'href')
    .then((nodePath) => Number(String(nodePath).split('/').pop()));
};

describe('Mobile app API: opening hours', () => {
  // Titles unique to the run, so leftovers from an earlier run cannot make the
  // tests pass.
  const branchTitle = `${nodeTitlePrefix} ${Date.now()}`;
  let branchId: number;
  // The category color is set by editors on the category, so the tests take
  // it from the first response and assert on its format.
  let color: string;

  before(() => {
    cy.deleteEntitiesIfExists(nodeTitlePrefix);
    createBranch(branchTitle).then((id) => {
      branchId = id;
    });
  });

  // Instances of deleted branches are left out of the response, so deleting
  // the branch is enough to clean up.
  after(() => {
    cy.deleteEntitiesIfExists(nodeTitlePrefix);
  });

  // The opening hours the tests add, as the apps expect to get them back.
  const expectedOpeningHours = (
    created: OpeningHours,
    request: OpeningHoursRequest,
  ): OpeningHours => ({
    id: created.id,
    category: { title: category, color },
    date: request.date,
    start_time: request.start_time,
    end_time: request.end_time,
    branch_id: branchId,
    branch_name: branchTitle,
    branch_isil_id: isilId,
    repetition: { ...request.repetition, id: created.repetition.id },
  });

  it('returns the opening hours an editor adds to a branch', () => {
    const request: OpeningHoursRequest = {
      category: { title: category },
      date: '2030-01-07',
      start_time: '09:00',
      end_time: '17:00',
      branch_id: branchId,
      repetition: { type: 'none' },
    };

    editOpeningHours('POST', request).then((created) => {
      expect(created).to.have.length(1);
      expect(created[0].id).to.be.a('number');
      expect(created[0].repetition.id).to.be.a('number');
      color = created[0].category.color;
      expect(color).to.match(/^#[0-9a-f]{6}$/i);
      const expected = expectedOpeningHours(created[0], request);

      getOpeningHours({
        branch_id: branchId,
        from_date: '2030-01-07',
        to_date: '2030-01-07',
      }).should('deep.equal', [expected]);

      // Without a branch, the opening hours of every branch are returned.
      getOpeningHours({ from_date: '2030-01-07', to_date: '2030-01-07' }).then(
        (openingHours) => {
          expect(openingHours).to.deep.include(expected);
        },
      );

      // Outside the dates, nothing is returned.
      getOpeningHours({
        branch_id: branchId,
        from_date: '2030-01-08',
        to_date: '2030-01-31',
      }).should('deep.equal', []);

      deleteOpeningHours(created[0].id);
    });
  });

  it('returns every week of weekly opening hours', () => {
    const request: OpeningHoursRequest = {
      category: { title: category },
      date: '2030-02-04',
      start_time: '10:00',
      end_time: '14:30',
      branch_id: branchId,
      repetition: { type: 'weekly', weekly_data: { end_date: '2030-02-18' } },
    };

    editOpeningHours('POST', request).then((created) => {
      expect(created).to.have.length(3);
      color = created[0].category.color;
      const expected = ['2030-02-04', '2030-02-11', '2030-02-18'].map(
        (date, index) => ({
          ...expectedOpeningHours(created[index], request),
          date,
        }),
      );

      getOpeningHours({
        branch_id: branchId,
        from_date: '2030-02-01',
        to_date: '2030-02-28',
      }).should('deep.equal', expected);

      // The dates are inclusive.
      getOpeningHours({
        branch_id: branchId,
        from_date: '2030-02-11',
        to_date: '2030-02-11',
      }).should('deep.equal', [expected[1]]);

      deleteOpeningHours(created[0].id, created[0].repetition.id);
      getOpeningHours({
        branch_id: branchId,
        from_date: '2030-02-01',
        to_date: '2030-02-28',
      }).should('deep.equal', []);
    });
  });

  it('reflects an editor updating and deleting opening hours', () => {
    const request: OpeningHoursRequest = {
      category: { title: category },
      date: '2030-03-04',
      start_time: '08:00',
      end_time: '12:00',
      branch_id: branchId,
      repetition: { type: 'none' },
    };
    const query = {
      branch_id: branchId,
      from_date: '2030-03-04',
      to_date: '2030-03-04',
    };

    editOpeningHours('POST', request).then((created) => {
      color = created[0].category.color;
      const updated: OpeningHoursRequest = {
        ...request,
        id: created[0].id,
        start_time: '11:00',
        end_time: '19:00',
        repetition: { ...request.repetition, id: created[0].repetition.id },
      };

      editOpeningHours('PATCH', updated);
      getOpeningHours(query).should('deep.equal', [
        expectedOpeningHours(created[0], updated),
      ]);

      deleteOpeningHours(created[0].id);
      getOpeningHours(query).should('deep.equal', []);
    });
  });
});
