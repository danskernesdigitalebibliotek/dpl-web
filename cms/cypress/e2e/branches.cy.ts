describe('Testing branch functionality', () => {
  const branchTitle = 'test-branch';
  const branchEmail = 'info+ddf@reload.dk';
  const branchPhone = '88 88 88 88';
  // We use the Ishøj address, as it's one of the "strange" addresses that only
  // show up as a house number (husnummer) in the address register, not as an
  // address (adresse).
  const branchAddressSearch = 'Ishøj Store Torv 1 2635';
  const branchAddressStreet = 'Ishøj Store Torv 1';
  const branchAddressPostal = '2635 Ishøj';

  // A second "strange" address, for the other direction: a house number that
  // stands in for the dwellings registered behind it. Searching the street and
  // number alone never lists them — the address register only does that once
  // the query has narrowed to one house number — so the widget offers a row
  // that goes and gets them.
  const floorBranchTitle = 'test-branch-floor';
  const floorAddressSearch = 'Dronningensgade 53';
  const floorAddressHouseNumber = 'Dronningensgade 53, 1420 København K';
  const floorAddressTitle = 'Dronningensgade 53, 1., 1420 København K';
  const floorAddressStreet = 'Dronningensgade 53, 1.';
  const floorAddressPostal = '1420 København K';

  it('Check that contact info show up on branches', () => {
    cy.deleteEntitiesIfExists(branchTitle);

    cy.drupalLogin('/node/add/branch');
    cy.get('#edit-title-0-value').type(branchTitle);

    cy.get('.meta-sidebar__trigger').click();
    cy.get('[name="field_email[0][value]"]').type(branchEmail);
    cy.get('[name="field_phone[0][value]"]').type(branchPhone);
    cy.get('.meta-sidebar__close').click();

    // Wait for the address lookup response before clicking, otherwise Select2's
    // tags:true may create a tag from typed text instead of a real result.
    cy.intercept('/dk-address/address/select2*').as('addressResults');
    cy.get('[name="field_address_gsearch[0][main][user_input]"]')
      .siblings('.select2-container')
      .click();
    cy.get('.select2-search__field').type(branchAddressSearch);
    cy.wait('@addressResults');
    cy.get('.select2-results__option')
      .contains(`${branchAddressStreet}, ${branchAddressPostal}`)
      .first()
      .click();
    cy.clickSaveButton();

    cy.get('.hero').contains(branchTitle).should('be.visible');
    cy.get('.hero').contains(branchEmail).should('be.visible');
    cy.get('.hero').contains(branchPhone).should('be.visible');
    // The address is rendered on two lines (street + postal) by the template.
    cy.get('.hero').contains(branchAddressStreet).should('be.visible');
    cy.get('.hero').contains(branchAddressPostal).should('be.visible');
  });

  it('Check that a floor can be picked behind a house number', () => {
    cy.deleteEntitiesIfExists(floorBranchTitle);

    cy.drupalLogin('/node/add/branch');
    cy.get('#edit-title-0-value').type(floorBranchTitle);

    cy.intercept('/dk-address/address/select2*').as('addressResults');
    cy.get('[name="field_address_gsearch[0][main][user_input]"]')
      .siblings('.select2-container')
      .click();
    cy.get('.select2-search__field').type(floorAddressSearch);
    cy.wait('@addressResults');

    // The street and number get no further than the entrance: one house number
    // per town, and no floors. Each house number that has floors behind it is
    // followed by a row repeating it, and that is the one that opens them.
    cy.get('.select2-results__option')
      .filter(`:contains("${floorAddressHouseNumber}")`)
      .should('have.length', 2)
      .eq(1)
      .click();
    cy.wait('@addressResults');

    cy.get('.select2-results__option')
      .contains(floorAddressTitle)
      .first()
      .click();
    cy.clickSaveButton();

    // The floor belongs to the street line, with the postal code below it.
    cy.get('.hero').contains(floorAddressStreet).should('be.visible');
    cy.get('.hero').contains(floorAddressPostal).should('be.visible');
  });

  describe('getBranches GraphQL query', () => {
    // A branch from the FBS branches mock (wiremock). It is used by no branch
    // node in the default content, so we are free to map one to it.
    const isilId = 'FBS-751030';
    const fbsTitle = 'ITK';
    const cacheBranchTitle = 'test-branch-cache';
    const cacheBranchUpdatedTitle = 'test-branch-cache-updated';

    type BranchResult = {
      isilId: string;
      title: string;
      phone: string | null;
      email: string | null;
      address: { street: string | null } | null;
    };

    const getBranches = (cmsConfigured?: boolean) =>
      cy
        .request({
          method: 'POST',
          url: '/graphql',
          body: {
            query: `query ($isilId: String, $cmsConfigured: Boolean) {
              getBranches(isilId: $isilId, cmsConfigured: $cmsConfigured) {
                isilId
                title
                phone
                email
                address { street }
              }
            }`,
            variables: { isilId, cmsConfigured },
          },
        })
        .then((response) => {
          expect(response.body.errors).to.equal(undefined);
          return response.body.data.getBranches as BranchResult[];
        });

    const assertNodeData = (title: string, phone: string, email: string) => {
      getBranches(true).then((branches) => {
        expect(branches).to.have.length(1);
        expect(branches[0]).to.include({ isilId, title, phone, email });
      });
      getBranches().then((branches) => {
        expect(branches).to.have.length(1);
        expect(branches[0]).to.include({ isilId, title, phone, email });
      });
    };

    const assertNoNodeData = () => {
      getBranches(true).then((branches) => {
        expect(branches).to.deep.equal([]);
      });
      getBranches().then((branches) => {
        expect(branches).to.deep.equal([
          {
            isilId,
            title: fbsTitle,
            phone: null,
            email: null,
            address: null,
          },
        ]);
      });
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

    it('reflects create, update and delete of branch nodes', () => {
      // Matches the updated title as well.
      cy.deleteEntitiesIfExists(cacheBranchTitle);

      // Querying before creating the node also warms the caches, so stale
      // cached data would make the following assertions fail.
      assertNoNodeData();

      cy.drupalLogin('/node/add/branch');
      fillBranchForm(cacheBranchTitle, '11 11 11 11', 'info+before@reload.dk');
      // The select2 widget is synced from the underlying select on submit.
      cy.get('select[name="field_agency_branch_id"]').select(isilId, {
        force: true,
      });
      cy.clickSaveButton();
      cy.get('.hero').contains(cacheBranchTitle).should('be.visible');

      assertNodeData(cacheBranchTitle, '11 11 11 11', 'info+before@reload.dk');

      cy.get('link[rel="shortlink"]')
        .invoke('attr', 'href')
        .then((nodePath) => {
          cy.visit(`${nodePath}/edit`);
        });
      fillBranchForm(
        cacheBranchUpdatedTitle,
        '22 22 22 22',
        'info+after@reload.dk',
      );
      cy.clickSaveButton();
      cy.get('.hero').contains(cacheBranchUpdatedTitle).should('be.visible');

      assertNodeData(
        cacheBranchUpdatedTitle,
        '22 22 22 22',
        'info+after@reload.dk',
      );

      cy.deleteEntitiesIfExists(cacheBranchUpdatedTitle);

      assertNoNodeData();
    });
  });
});
