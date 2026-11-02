import { GoNodeAddPage } from './go-node-add';

export class GoArticleAddPage extends GoNodeAddPage {
  constructor() {
    super('go_article');
  }

  selectTeaserImage(fileName: string) {
    this.selectSidebarImage('field_teaser_image', fileName);
  }
}
