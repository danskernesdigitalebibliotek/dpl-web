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
});
