describe('Testing branch functionality', () => {
  const branchTitle = 'test-branch';
  const branchEmail = 'info+ddf@reload.dk';
  const branchPhone = '88 88 88 88';
  const branchAddress = 'Suomisvej 2, 2.';
  const branchAddressFull = 'Suomisvej 2, 2., 1927 Frederiksberg C';

  it('Check that contact info show up on branches', () => {
    cy.deleteEntitiesIfExists(branchTitle);

    cy.drupalLogin('/node/add/branch');
    cy.get('#edit-title-0-value').type(branchTitle);

    cy.get('.meta-sidebar__trigger').click();
    cy.get('[name="field_email[0][value]"]').type(branchEmail);
    cy.get('[name="field_phone[0][value]"]').type(branchPhone);
    cy.get('.meta-sidebar__close').click();

    cy.get(
      '[data-drupal-selector="edit-field-address-gsearch-wrapper"] .select2-selection',
    )
      .click()
      .type(' ' + branchAddress);
    // Finding the full address using GSearch.
    cy.get('.select2-results__option')
      .contains(branchAddressFull)
      .first()
      .click();
    cy.clickSaveButton();

    cy.get('.hero').contains(branchTitle).should('be.visible');
    cy.get('.hero').contains(branchEmail).should('be.visible');
    cy.get('.hero').contains(branchPhone).should('be.visible');
    cy.get('.hero').contains(branchTitle).should('be.visible');
    cy.get('.hero').contains(branchAddressFull).should('be.visible');
  });
});
