describe('User journey', () => {
  it('Shows search suggestions & redirects to search result page', () => {
    cy.visit('/arrangementer')
      .getBySel('search-header-input')
      .type('harry')
      .getBySel('autosuggest')
      .should('be.visible')
      .getBySel('autosuggest-text-item')
      .first()
      .click()
      .url()
      .should('include', 'search?q=Harry%2520Potter');
  });

  it('Shows search results & redirects to material page', () => {
    cy.visit('/search?q=Harry+Potter')
      .getBySel('search-result-header')
      .should('contain', 'Showing results for "Harry Potter"')
      .getBySel('card-list-item-availability')
      .should('exist');

    cy.getBySel('card-list-item')
      .first()
      .click()
      .url()
      .should('include', 'work/work-of:870970-basis:54181744');
  });

  it('Shows material page & reservation button is rendered', () => {
    cy.visit('/work/work-of:870970-basis:54181744')
      .getBySel('material-header-content')
      .scrollIntoView()
      .contains('Harry Potter og Fønixordenen');
    // Wait for service to fill reserve button with the right text.
    // TODO: Consider using the pipe package in the future...
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.getBySel('material-header-buttons-physical').should(
      'contain',
      'Reserve bog',
    );
  });

  it('Can open reservation modal & reserve a material', () => {
    const authorizationCode = '7c5e3213aea6ef42ec97dfeaa6f5b1d454d856dc';
    const accessToken = '447131b0a03fe0421204c54e5c21a60d70030fd1';
    const userGuid = '19a4ae39-be07-4db9-a8b7-8bbb29f03da6';
    const userCPR = 9999999999;
    cy.adgangsplatformenLogin({
      authorizationCode,
      accessToken,
      userCPR,
      userGuid,
    });
    cy.visit('/work/work-of:870970-basis:54181744');
    cy.getBySel('material-header-author-text').scrollIntoView();
    cy.getBySel('material-header-buttons-physical').click();
    // We have to wait for the modal to be fully rendered.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.getBySel('reservation-modal-parallel')
      .should('be.visible')
      .and('contain', 'Harry Potter og Fønixordenen');
    // We have to wait for the modal to be fully rendered
    // and the event listeners to be attached.
    // Read more: https://www.cypress.io/blog/2019/01/22/when-can-the-test-click/
    // TODO: Consider using the pipe package in the future...
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.getBySel('reservation-modal-submit-button').click();
    cy.getBySel('reservation-success-title-text')
      .should('exist')
      .and('contain', 'The material is available and is now reserved for you!');
  });

  afterEach(() => {
    cy.logMappingRequests();
  });
});
