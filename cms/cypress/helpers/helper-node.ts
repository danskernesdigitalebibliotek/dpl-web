export type TestNode = {
  id: string;
  paragraphs: { id: string }[];
  path: string;
};

// The apps get the IDs of content from other content, such as a GO linkbox
// pointing at an article. The tests look the IDs up through the route
// instead, which the mobile GraphQL consumer may query too.
const GET_NODE_IDS = `query ($path: String!) {
  route(path: $path) {
    ... on RouteInternal {
      entity {
        ... on NodePage {
          id
          paragraphs {
            ... on ParagraphInterface {
              id
            }
          }
        }
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

// The content overview is an admin page, so it links to the node's path on
// the CMS rather than on the GO site.
export const getNode = (title: string) => {
  cy.visit(
    `/admin/content?title=${encodeURIComponent(title)}&status=All&langcode=All`,
  );
  return cy
    .contains('a', title)
    .invoke('attr', 'href')
    .then((path) =>
      cy
        .queryMobileAppGraphql<{
          route: { entity: Omit<TestNode, 'path'> };
        }>(GET_NODE_IDS, { path })
        .then(({ data }): TestNode => ({ ...data.route.entity, path: path! })),
    );
};

// Opens the edit form of the node from the content overview, which sends us
// back there on save, as saving GO content otherwise redirects to the GO site.
export const openNodeEditForm = (title: string) => {
  cy.drupalLogin(
    `/admin/content?title=${encodeURIComponent(title)}&status=All&langcode=All`,
  );
  cy.contains('tr', title).contains('a', 'Edit').click();
};

export const setNodePublished = (title: string, published: boolean) => {
  openNodeEditForm(title);
  cy.get('[name="status[value]"]')[published ? 'check' : 'uncheck']({
    force: true,
  });
  cy.clickSaveButton();
  cy.contains(`${title} has been updated.`);
};
