import { typeInCkEditor } from './helper-ckeditor';
import { mediaLibrarySelect } from './helper-media';
import { getNode } from './helper-node';
import { addParagraph } from './helper-paragraph';

// Saving GO content redirects to the GO site, which Cypress cannot follow, so
// the add forms send us to the content overview instead.
export const openGoNodeForm = (type: 'go_article' | 'go_category') => {
  // The images the GO content needs are picked in Gin's sidebar, which is
  // collapsed at the default viewport width.
  cy.viewport(1440, 900);
  cy.drupalLogin(`/node/add/${type}?destination=/admin/content`);
};

export const createGoArticle = (title: string, body: string) => {
  openGoNodeForm('go_article');
  cy.findByLabelText('Title').type(title);
  mediaLibrarySelect('#field_teaser_image-media-library-wrapper', 'paige-cody');
  cy.openParagraphsModal();
  addParagraph('GO Text Body');
  typeInCkEditor(body);
  cy.clickSaveButton();
  cy.contains(`GO Article ${title} has been created.`);
  return getNode(title);
};
