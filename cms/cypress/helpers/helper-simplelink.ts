export const addSimpleLink = ({ link, index = 0 }) => {
  if (index > 0) {
    cy.get(`input[value="Add another item"]`).click();
  }
  cy.findAllByLabelText('URL').eq(index).type(link.url);
  cy.findAllByLabelText('Link text').eq(index).type(link.text);
  if (link.targetBlank) {
    cy.findAllByLabelText('Open link in new window/tab').eq(index).check();
  }
};

export const verifySimpleLink = ({ link, index = 0 }) => {
  cy.get('.paragraphs__item--simple_links a')
    .eq(index)
    .should('contain', link.text)
    .and('have.attr', 'href', link.url);
  if (link.targetBlank) {
    cy.get('.paragraphs__item--simple_links a')
      .eq(index)
      .should('have.attr', 'target', '_blank');
  }
};
