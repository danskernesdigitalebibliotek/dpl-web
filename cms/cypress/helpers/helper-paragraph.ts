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

// Adds a paragraph after the ones already added, through the last of the
// buttons between them.
export const appendParagraph = (paragraphType: string) => {
  cy.get("button[title='Show all Paragraphs']:visible").last().click();
  addParagraph(paragraphType);
};

// Fields of paragraph number delta in the form, by their name. Use as
// cy.get(`${paragraphField(0)}[field_title][0][value]"]`).
export const paragraphField = (delta: number) =>
  `[name^="field_paragraphs[${delta}][subform]`;

// Material search widgets keep the work ID in a hidden input, which a React
// app fills in when the editor picks a material. Searching for materials needs
// FBI, so the tests fill in the input directly.
export const setWorkId = (selector: string, workId: string) => {
  cy.get(selector).invoke('val', workId);
};
