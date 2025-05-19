describe('Testing contrib modules', () => {
  it('content_lock', () => {
    cy.drupalLogin('/admin/content');

    // Making sure all content is unlocked initially.
    cy.get('[title="Select all rows in this table"]').check();
    cy.get('[data-drupal-selector="edit-action"]').select(
      'node_break_lock_action',
    );
    cy.get('[value="Apply to selected items"]').click({ force: true });

    cy.get('.views-table tbody tr')
      .should('include.text', 'Edit')
      .first()
      .as('firstContent');
    cy.get('@firstContent').should('not.include.text', 'Locked by');
    // We need to force it, as Cypress gets confused about the floating header.
    cy.get('@firstContent').contains('Edit').click({ force: true });

    cy.visit('/admin/content');

    cy.get('.views-table tbody tr')
      .should('include.text', 'Edit')
      .first()
      .as('firstContent');
    cy.get('@firstContent').should('include.text', 'Locked by');
    // We need to force it, as Cypress gets confused about the floating header.
    cy.get('@firstContent')
      .get('.dropbutton__toggle')
      .first()
      .click({ force: true });
    cy.get('@firstContent').contains('Break lock').click({ force: true });
    cy.contains('Confirm break lock').click();
    cy.visit('/admin/content');

    cy.get('.views-table tbody tr')
      .should('include.text', 'Edit')
      .first()
      .as('firstContent');
    cy.get('@firstContent').should('not.include.text', 'Locked by');
  });

  it('flat_taxonomy', () => {
    cy.drupalLogin(
      '/admin/structure/taxonomy/manage/tags?destination=/admin/structure/taxonomy/manage/tags/overview',
    );
    cy.get('[data-drupal-selector="edit-flat"]').check();
    cy.get('[data-drupal-selector="edit-submit"]').click();
    cy.get('.tabledrag-handle[title="Move in any direction"]').should(
      'not.exist',
    );
    cy.get('.tabledrag-handle[title="Change order"]').should('exist');

    cy.drupalLogin(
      '/admin/structure/taxonomy/manage/tags?destination=/admin/structure/taxonomy/manage/tags/overview',
    );
    cy.get('[data-drupal-selector="edit-flat"]').uncheck();
    cy.get('[data-drupal-selector="edit-submit"]').click();
    cy.get('.tabledrag-handle[title="Move in any direction"]').should('exist');
    cy.get('.tabledrag-handle[title="Change order"]').should('not.exist');
  });
});
