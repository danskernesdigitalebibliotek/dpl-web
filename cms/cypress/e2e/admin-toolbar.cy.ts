describe('Testing admin_toolbar contrib module', () => {
  it('Check that the admin dropdown menu is usable from frontend', () => {
    cy.drupalLogin('/');

    // The admin menu also adds the logo as a link, so we want to be pretty
    // explicit with which dropdown we target.
    cy.get('.menu-item__system-admin_content').first().as('menuItem');

    cy.get('@menuItem').find('.menu-item').first().as('menuItemChild');

    cy.get('@menuItemChild').should('not.be.visible');
    cy.get('@menuItem').trigger('mouseenter');
    cy.get('@menuItemChild').should('be.visible');
  });
});
