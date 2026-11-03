import { typeInCkEditor } from './helper-ckeditor';
import { mediaLibrarySelect } from './helper-media';
import { addParagraph } from './helper-paragraph';

export type GoNode = {
  id: string;
  paragraphs: { id: string }[];
  path: string;
};

// The apps get the IDs of GO content from other content, such as a GO linkbox
// pointing at an article. The tests look the IDs up through the route
// instead, which the mobile GraphQL consumer may query too.
const GET_GO_NODE_IDS = `query ($path: String!) {
  route(path: $path) {
    ... on RouteInternal {
      entity {
        ... on NodeGoArticle {
          id
          paragraphs {
            ... on ParagraphInterface {
              id
            }
          }
        }
        ... on NodeGoCategory {
          id
          paragraphs {
            ... on ParagraphInterface {
              id
            }
          }
        }
      }
    }
  }
}`;

// Saving GO content redirects to the GO site, which Cypress cannot follow, so
// the add forms send us to the content overview instead.
export const openGoNodeForm = (type: 'go_article' | 'go_category') => {
  // The images the GO content needs are picked in Gin's sidebar, which is
  // collapsed at the default viewport width.
  cy.viewport(1440, 900);
  cy.drupalLogin(`/node/add/${type}?destination=/admin/content`);
};

// The content overview is an admin page, so it links to the node's path on
// the CMS rather than on the GO site.
export const getGoNode = (title: string) => {
  cy.visit(
    `/admin/content?title=${encodeURIComponent(title)}&status=All&langcode=All`,
  );
  return cy
    .contains('a', title)
    .invoke('attr', 'href')
    .then((path) =>
      cy
        .queryMobileAppGraphql<{
          route: { entity: Omit<GoNode, 'path'> };
        }>(GET_GO_NODE_IDS, { path })
        .then(({ data }): GoNode => ({ ...data.route.entity, path: path! })),
    );
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
  return getGoNode(title);
};
