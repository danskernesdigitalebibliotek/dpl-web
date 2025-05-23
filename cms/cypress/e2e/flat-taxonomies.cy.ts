describe('Testing flat_taxonomy contrib module', () => {
  it('Check that we can move in any direction with default behavior', () => {
    cy.drupalLogin(
      '/admin/structure/taxonomy/manage/tags?destination=/admin/structure/taxonomy/manage/tags/overview',
    );
    cy.get('[data-drupal-selector="edit-flat"]').check();
    cy.get('[data-drupal-selector="edit-submit"]').click();
    cy.get('.tabledrag-handle[title="Move in any direction"]').should(
      'not.exist',
    );
    cy.get('.tabledrag-handle[title="Change order"]').should('exist');
  });

  it('Check that we can only move in Y-direction with module behavior', () => {
    cy.drupalLogin(
      '/admin/structure/taxonomy/manage/tags?destination=/admin/structure/taxonomy/manage/tags/overview',
    );
    cy.get('[data-drupal-selector="edit-flat"]').uncheck();
    cy.get('[data-drupal-selector="edit-submit"]').click();
    cy.get('.tabledrag-handle[title="Move in any direction"]').should('exist');
    cy.get('.tabledrag-handle[title="Change order"]').should('not.exist');
  });
});
