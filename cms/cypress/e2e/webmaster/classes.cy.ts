import { LoginPage } from '../../pages/login-page';
import { NodeAddArticlePage } from '../../pages/node-add-article';

describe('Webmaster custom content CSS classes', () => {
  beforeEach(() => {
    LoginPage.ensureLogin(
      Cypress.env('DRUPAL_USERNAME'),
      Cypress.env('DRUPAL_PASSWORD'),
    );
  });

  it('Allows setting CSS classes on nodes and paragraphs', () => {
    const nodeAdd = new NodeAddArticlePage();

    nodeAdd.visit([]);
    nodeAdd.fillTitle('Classes test');
    // Set node classes before adding paragraph so we don't get the
    // wrong field. This could be fixed by varying the titles.
    nodeAdd.fillClasses('css-class-red');
    nodeAdd.addParagraph('Text body');

    nodeAdd.fillParagraphText('Some text body.');
    nodeAdd.fillParagraphClasses('css-class-blue');

    nodeAdd.save();

    cy.get('article.article.css-class-red').should('exist');
    cy.get('div.paragraphs__item--text_body.css-class-blue').should('exist');
  });
});
