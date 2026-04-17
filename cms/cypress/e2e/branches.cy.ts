describe('Testing branch functionality', () => {
  const branchTitle = 'test-branch';
  const branchEmail = 'info+ddf@reload.dk';
  const branchPhone = '88 88 88 88';
  // We use the Ishøj address, as it's one of the "strange" addresses that only
  // show up in /husnummer of Dataforsyningen, but not in /adresse.
  const branchAddressSearch = 'Ishøj Store Torv 1 2635';
  const branchAddressStreet = 'Ishøj Store Torv 1';
  const branchAddressPostal = '2635 Ishøj';

  it('Check that contact info show up on branches', () => {
    cy.deleteEntitiesIfExists(branchTitle);

    cy.drupalLogin('/node/add/branch');
    cy.get('#edit-title-0-value').type(branchTitle);

    cy.get('.meta-sidebar__trigger').click();
    cy.get('[name="field_email[0][value]"]').type(branchEmail);
    cy.get('[name="field_phone[0][value]"]').type(branchPhone);
    cy.get('.meta-sidebar__close').click();

    // Wait for the GSearch API response before clicking, otherwise Select2's
    // tags:true may create a tag from typed text instead of a real result.
    cy.intercept('/gsearch/address/select2*').as('gsearchResults');
    cy.get('[name="field_address_gsearch[0][user_input]"]')
      .siblings('.select2-container')
      .click();
    cy.get('.select2-search__field').type(branchAddressSearch);
    cy.wait('@gsearchResults');
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
});
