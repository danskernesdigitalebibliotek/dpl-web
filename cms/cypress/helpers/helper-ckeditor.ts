// INSPRIATION: https://drupal.stackexchange.com/questions/315635/how-to-write-in-a-ckdeditor-textarea-with-cypress
export const typeInCkEditor = (content: string) => {
  // Ensure the CKEditor is visible
  cy.get('.ck-editor__editable').should('be.visible');

  cy.window().then((win) => {
    // @ts-expect-error - Drupal may not exist on the window object
    if (win.Drupal && win.Drupal.CKEditor5Instances) {
      // @ts-expect-error - CKEditor5Instances may not match expected structure
      win.Drupal.CKEditor5Instances.forEach(
        (editor: { setData: (content: string) => void }) => {
          editor.setData(content);
        },
      );
    }
  });
};
