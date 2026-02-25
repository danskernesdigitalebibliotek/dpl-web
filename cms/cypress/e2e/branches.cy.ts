describe('Testing branch functionality', () => {
  const branchTitle = 'test-branch';
  const branchEmail = 'info+ddf@reload.dk';
  const branchPhone = '88 88 88 88';
  const branchAddress = 'Krystalgade 15 1172';
  const branchAddressStreet = 'Krystalgade 15';
  const branchAddressPostal = '1172 København K';

  it('Check that contact info show up on branches', () => {
    cy.deleteEntitiesIfExists(branchTitle);

    cy.drupalLogin('/node/add/branch');
    cy.get('#edit-title-0-value').type(branchTitle);

    cy.get('.meta-sidebar__trigger').click();
    cy.get('[name="field_email[0][value]"]').type(branchEmail);
    cy.get('[name="field_phone[0][value]"]').type(branchPhone);
    cy.get('.meta-sidebar__close').click();

    // The GSearch field uses Select2 with AJAX autocomplete.
    // We must wait for the API response before clicking, because Select2's
    // tags:true creates a temporary option from the typed text immediately.
    // Clicking that tag instead of a real result loses structured address data.
    cy.intercept('/gsearch/address/select2*').as('gsearchResults');
    cy.get('[name="field_address_gsearch[0][user_input]"]')
      .siblings('.select2-container')
      .click();
    cy.get('.select2-search__field').type(branchAddress);
    cy.wait('@gsearchResults');
    cy.get('.select2-results__option')
      .contains('Krystalgade 15')
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
