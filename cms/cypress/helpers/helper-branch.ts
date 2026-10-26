type PickBranchAddress = {
  // What to type in the address widget.
  search: string;
  // The result to pick.
  option: string;
  // A house number that stands in for the dwellings registered behind it.
  // Searching the street and number alone never lists them — the address
  // register only does that once the query has narrowed to one house number —
  // so the widget follows each such house number with a row repeating it, and
  // that is the one that opens them.
  houseNumber?: string;
};

// Picks an address in the address widget on the branch node form.
export const pickBranchAddress = ({
  search,
  option,
  houseNumber,
}: PickBranchAddress) => {
  // Wait for the address lookup response before clicking, otherwise Select2's
  // tags:true may create a tag from typed text instead of a real result.
  cy.intercept('/dk-address/address/select2*').as('addressResults');
  cy.get('[name="field_address_gsearch[0][main][user_input]"]')
    .siblings('.select2-container')
    .click();
  cy.get('.select2-search__field').type(search);
  cy.wait('@addressResults');

  if (houseNumber) {
    cy.get('.select2-results__option')
      .filter(`:contains("${houseNumber}")`)
      .should('have.length', 2)
      .eq(1)
      .click();
    cy.wait('@addressResults');
  }

  cy.get('.select2-results__option').contains(option).first().click();
};
