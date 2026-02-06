describe('Testing branch functionality', () => {
  const branchTitle = 'test-branch';
  const branchEmail = 'info+ddf@reload.dk';
  const branchPhone = '88 88 88 88';
  const branchAddress = 'Krystalgade 15 1172';
  const branchAddressFull = 'Krystalgade 15 st. 1172 København K';

  it('Check that contact info show up on branches', () => {
    cy.deleteEntitiesIfExists(branchTitle);

    cy.drupalLogin('/node/add/branch');
    cy.get('#edit-title-0-value').type(branchTitle);

    cy.get('.meta-sidebar__trigger').click();
    cy.get('[name="field_email[0][value]"]').type(branchEmail);
    cy.get('[name="field_phone[0][value]"]').type(branchPhone);
    cy.get('.meta-sidebar__close').click();

    cy.get('[name="field_address_dawa[0][address]"]').type(branchAddress);
    // Finding the full address using DAWA.
    cy.get('a').contains(branchAddressFull).first().click();
    cy.clickSaveButton();

    cy.get('.hero').contains(branchTitle).should('be.visible');
    cy.get('.hero').contains(branchEmail).should('be.visible');
    cy.get('.hero').contains(branchPhone).should('be.visible');
    cy.get('.hero').contains(branchTitle).should('be.visible');
    cy.get('.hero').contains(branchAddressFull).should('be.visible');
  });
});
