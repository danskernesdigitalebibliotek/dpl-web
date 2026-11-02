export const addParagraph = (paragraphType: string) => {
  cy.get(`button[value="${paragraphType}"]`).click({
    multiple: true,
    force: true,
  });
};

export const addAnotherParagraph = () => {
  cy.get("button[title='Show all Paragraphs']")
    .should('be.visible')
    .eq(1)
    .click();
};
