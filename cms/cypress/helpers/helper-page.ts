export const createTestPageAndOpenParagraphModal = (pageName: string) => {
  cy.drupalLogin('/node/add/page');
  cy.findByLabelText('Title').type(pageName);
  cy.openParagraphsModal();
};
