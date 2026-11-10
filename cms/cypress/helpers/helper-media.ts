// Numbers the calls, so their intercepts can be told apart.
let selectCount = 0;

// INSPRIATION: https://github.com/kanopi/shrubs/blob/main/mediaLibrarySelect.js
export const mediaLibrarySelect = (
  selector: string,
  fileName: string,
  index = 0,
  // The path of the form the media field is on. Event forms are not node
  // forms.
  formPathname = /^\/node\//,
) => {
  // Create unique intercepts for each media library select. Waiting on an
  // alias takes the oldest request not yet waited on, so an alias shared with
  // an earlier call would take a request that call never waited on, such as
  // adding a paragraph to the form.
  selectCount += 1;
  const mediaNodeEditAjax = `mediaNodeEditAjax${selectCount}`;
  const mediaLibraryAjax = `mediaLibraryAjax${selectCount}`;
  const viewsAjax = `viewsAjax${selectCount}`;

  // Only the form's AJAX requests, so saving a node form earlier in the same
  // test is not taken for one of them.
  cy.intercept({
    method: 'POST',
    pathname: formPathname,
    query: { ajax_form: '1' },
  }).as(mediaNodeEditAjax);
  cy.intercept('POST', '/media-library**').as(mediaLibraryAjax);
  // Matched on the path only, as the query can carry the form's own query,
  // such as a destination, and globs do not match slashes in it.
  cy.intercept({ method: 'GET', pathname: '/views/ajax' }).as(viewsAjax);

  cy.get(selector).within(() => {
    cy.get('input[value="Add media"]').click();
  });

  cy.wait(`@${mediaNodeEditAjax}`).its('response.statusCode').should('eq', 200);

  cy.get('.media-library-widget-modal').within(() => {
    cy.get('.views-exposed-form input[name="search"]').clear();
    cy.get('.views-exposed-form input[name="search"]').type(fileName);
    cy.get('.views-exposed-form input[type="submit"]').click();
    cy.wait(`@${viewsAjax}`, { timeout: 10000 })
      .its('response.statusCode')
      .should('eq', 200);
    cy.get('.media-library-views-form .views-row').first().click();

    cy.get('.form-actions button').contains('Insert selected').click();
  });

  cy.wait(`@${mediaNodeEditAjax}`).its('response.statusCode').should('eq', 200);

  // Validate the image appears in the preview to address flakiness in GH actions.
  cy.get('.media-library-item__preview-wrapper')
    .eq(index)
    .within(() => {
      cy.get('.field--name-field-media-image img')
        .should('exist')
        .and('have.attr', 'src')
        .and('include', fileName);
    });
};

type CheckImageSrcType = {
  selector: string;
  expectedInSrc: string;
};

export const checkImageSrc = ({
  selector,
  expectedInSrc,
}: CheckImageSrcType) => {
  cy.get(selector).should('have.attr', 'src').should('include', expectedInSrc);
};
