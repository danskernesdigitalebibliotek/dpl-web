import { GoNodeAddPage } from './go-node-add';

export class GoArticleAddPage extends GoNodeAddPage {
  constructor() {
    super('go_article');
  }

  /**
   * Starts an article with the fields every article needs.
   */
  static add(title: string) {
    const articleAdd = new GoArticleAddPage();
    articleAdd.visitReturningToContent();
    articleAdd.fillTitle(title);
    articleAdd.selectTeaserImage('paige-cody');
    return articleAdd;
  }

  selectTeaserImage(fileName: string) {
    this.selectSidebarImage('field_teaser_image', fileName);
  }
}
