// INSPRIATION: https://github.com/kanopi/shrubs/blob/main/mediaLibrarySelect.js
export const mediaLibrarySelect = (
  selector: string,
  fileName: string,
  index = 0,
) => {
  // Create unique intercepts for each media library select
  const mediaNodeEditAjax = `mediaNodeEditAjax${index}`;
  const mediaLibraryAjax = `mediaLibraryAjax${index}`;
  const viewsAjax = `viewsAjax${index}`;

  cy.intercept('POST', '/node/*/**').as(mediaNodeEditAjax);
  cy.intercept('POST', '/media-library**').as(mediaLibraryAjax);
  cy.intercept('GET', '/views/ajax?**').as(viewsAjax);

  cy.get(selector).within(() => {
    cy.get('input[value="Add media"]').click();
  });

  cy.wait(`@${mediaNodeEditAjax}`).its('response.statusCode').should('eq', 200);

  cy.get('.media-library-widget-modal').within(() => {
    cy.get('.views-exposed-form input[name="search"]').clear().type(fileName);
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
