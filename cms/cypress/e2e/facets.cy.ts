describe('Testing facet contrib module', () => {
  it('Check that facets on /articles has effect', () => {
    cy.visit('/articles');

    // Get initial count of items
    cy.get('.content-list__item').then((items) => {
      const originalCount = items.length;

      // Select second option in the dropdown (index 1)
      // We select the second option, as the first option is "- All -".
      cy.get('.facets-dropdown').first().select(1);

      // Wait for page to update, then compare item count, to see that we now
      // have fewer results.
      cy.get('.content-list__item').should(
        'have.length.lessThan',
        originalCount,
      );
    });
  });
});
