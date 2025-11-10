import { WorkPage } from '../../pages/work-page';

describe('Work page', () => {
  it('Has the title of the work', () => {
    const work = new WorkPage();

    work.visit(['work-of:870970-basis:25245784']);
    cy.getBySel('material-header-content')
      .scrollIntoView()
      .contains('Harry Potter og Fønixordenen');

    work.elements
      .page_title()
      .should('eq', 'Harry Potter og Fønixordenen | DPL CMS');

    work.metaProperty('og:site_name').should('eq', 'DPL CMS');
    work.metaProperty('og:url').should('eq', 'http://varnish:8080/work/work-of%3A870970-basis%3A25245784');
    // See comment in dpl_react_apps_preprocess_html() as to why this is.
    work.metaProperty('og:type').should('eq', 'website');

    work.metaProperty('og:title').should('eq', 'Harry Potter og Fønixordenen');
  });
});
