import { ContentListPage } from '../pages/content-list';

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

export const getNode = (title: string) =>
  new ContentListPage().pathOf(title).then((path) =>
    cy
      .queryMobileAppGraphql<{
        route: { entity: Omit<TestNode, 'path'> };
      }>(GET_NODE_IDS, { path })
      .then(({ data }): TestNode => ({ ...data.route.entity, path })),
  );
