import { NodeFormPage } from './node-form';

/**
 * The form for adding GO content.
 */
export class GoNodeAddPage extends NodeFormPage {
  constructor(type: 'go_article' | 'go_category') {
    super(`/node/add/${type}`);
  }

  /**
   * Visits the form, so that saving it shows the content overview.
   *
   * Saving GO content redirects to the GO site, which Cypress cannot follow.
   */
  visitReturningToContent() {
    this.visit([], { qs: { destination: '/admin/content' } });
  }
}
