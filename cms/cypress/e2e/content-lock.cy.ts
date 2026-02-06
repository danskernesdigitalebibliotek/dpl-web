describe('Testing content_lock contrib module', () => {
  it('Testing that locking/unlocking content works', () => {
    cy.drupalLogin('/admin/content');

    // Making sure all content is unlocked initially.
    // We need to add force, as Gin adds pointer-events: none, meaning the
    // element should not be clickable by keyboard.
    cy.get('[title="Select all rows in this table"]').check({ force: true });
    cy.get('#edit-bulk-actions-container [data-drupal-selector="edit-action"]')
      .select('node_break_lock_action')
      .should('have.value', 'node_break_lock_action');
    cy.get('[value="Apply to selected items"]').click({ force: true });

    cy.visit(`/admin/content?cachebuster=${Math.random()}`);

    cy.get('.views-table tbody tr')
      .should('include.text', 'Edit')
      .first()
      .as('firstContent');
    cy.get('@firstContent').should('not.include.text', 'Locked by');
    // We need to force it, as Cypress gets confused about the floating header.
    cy.get('@firstContent').contains('Edit').click({ force: true });

    // There is a known issue in the module, that means that the overview view
    // might not display the latest content lock information.
    // We get around this, by putting a cachebuster on the URL, as we prefer
    // not to use content_locks own 'solution' of having no cache on the view.
    // The lock information is still shown for the user, when they enter the
    // edit page.
    cy.visit(`/admin/content?cachebuster=${Math.random()}`);

    // Finding the first editable content
    cy.get('.views-table tbody tr')
      .should('include.text', 'Edit')
      .first()
      .as('firstContent');

    // Checking that it is now locked.
    cy.get('@firstContent').should('include.text', 'Locked by');

    // Open the dropdown menu to find the 'break lock' button.
    cy.get('@firstContent')
      .get('.dropbutton__toggle')
      .first()
      // We need to force it, as Cypress gets confused about the floating header.
      .click({ force: true });
    cy.get('@firstContent').contains('Break lock').click({ force: true });
    cy.contains('Confirm break lock').click();

    cy.visit(`/admin/content?cachebuster=${Math.random()}`);

    cy.get('.views-table tbody tr')
      .should('include.text', 'Edit')
      .first()
      .as('firstContent');
    cy.get('@firstContent').should('not.include.text', 'Locked by');
  });
});
