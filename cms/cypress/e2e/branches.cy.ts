describe('Testing branch functionality', () => {
  const branchTitle = 'test-branch';
  const branchEmail = 'info+ddf@reload.dk';
  const branchPhone = '88 88 88 88';
  const branchAddress = 'Krystalgade 15 1172';
  const branchAddressSelect = 'Krystalgade 15, st., 1172 København K';
  const branchAddressStreet = 'Krystalgade 15, st.';
  const branchAddressPostal = '1172 København K';

  it('Check that contact info show up on branches', () => {
    cy.deleteEntitiesIfExists(branchTitle);

    cy.drupalLogin('/node/add/branch');
    cy.get('#edit-title-0-value').type(branchTitle);

    cy.get('.meta-sidebar__trigger').click();
    cy.get('[name="field_email[0][value]"]').type(branchEmail);
    cy.get('[name="field_phone[0][value]"]').type(branchPhone);
    cy.get('.meta-sidebar__close').click();

    // The GSearch field uses Select2 with autocomplete.
    cy.get('[name="field_address_gsearch[0][user_input]"]')
      .siblings('.select2-container')
      .click();
    cy.get('.select2-search__field').type(branchAddress);
    // Finding the full address using GSearch.
    cy.get('.select2-results__option').contains(branchAddressSelect).click();
    cy.clickSaveButton();

    cy.get('.hero').contains(branchTitle).should('be.visible');
    cy.get('.hero').contains(branchEmail).should('be.visible');
    cy.get('.hero').contains(branchPhone).should('be.visible');
    // The address is rendered on two lines (street + postal) by the template.
    cy.get('.hero').contains(branchAddressStreet).should('be.visible');
    cy.get('.hero').contains(branchAddressPostal).should('be.visible');
  });
});
