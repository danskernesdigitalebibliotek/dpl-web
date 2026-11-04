import { ComponentObject, Elements } from '@hammzj/cypress-page-object';
import { typeInCkEditor } from '../helpers/helper-ckeditor';

/**
 * A paragraph in the paragraphs field of a node form.
 */
export abstract class ParagraphComponent extends ComponentObject {
  public elements: Elements;

  /**
   * @param delta
   *   The position of the paragraph in the field, counting from 0.
   */
  constructor(delta: number) {
    super(() =>
      cy.get(`[data-drupal-selector="edit-field-paragraphs-${delta}-subform"]`),
    );
  }

  /**
   * Material search widgets keep the work ID in a hidden input, which a React
   * app fills in when the editor picks a material. Searching for materials
   * needs FBI, so the work ID is filled in directly.
   */
  protected fillWorkId(workId: string) {
    this.container()
      .findAllByLabelText('Field work ID')
      .first()
      .invoke('val', workId);
  }
}

/**
 * A paragraph type, as the paragraph types dialog lists it.
 */
export type ParagraphType<T extends ParagraphComponent> = {
  new (delta: number): T;
  label: string;
};

export class TextBodyParagraph extends ParagraphComponent {
  static label = 'Text body';

  fillBody(body: string) {
    typeInCkEditor(body);
  }
}

export class GoTextBodyParagraph extends TextBodyParagraph {
  static label = 'GO Text Body';
}

export class RecommendationParagraph extends ParagraphComponent {
  static label = 'Recommendation';

  constructor(delta: number) {
    super(delta);
    this.addElements = {
      imagePositionRightField: () =>
        this.container().findByLabelText('Image position right'),
      titleField: () => this.container().findByLabelText('Title'),
      descriptionField: () => this.container().findByLabelText('Description'),
    };
  }

  placeImageRight() {
    this.elements.imagePositionRightField().check();
  }

  fillTitle(title: string) {
    this.elements.titleField().type(title);
  }

  fillDescription(description: string) {
    this.elements.descriptionField().type(description);
  }

  selectWork(workId: string) {
    this.fillWorkId(workId);
  }
}

export class NavSpotsManualParagraph extends ParagraphComponent {
  static label = 'Navigation spots - manual';

  constructor(delta: number) {
    super(delta);
    this.addElements = {
      // The content autocompletes, which have no label of their own.
      contentField: () =>
        this.container().find('input[data-drupal-selector$="-target-id"]'),
    };
  }

  /**
   * Links to content by its title, which must be unique.
   */
  linkContent(title: string) {
    this.elements.contentField().first().type(title);
  }
}

export class MaterialGridAutomaticParagraph extends ParagraphComponent {
  static label = 'Material grid automatic';

  constructor(delta: number) {
    super(delta);
    this.addElements = {
      titleField: () =>
        this.container().findByLabelText('Title of the material grid'),
      descriptionField: () =>
        this.container().findByLabelText('Material grid description'),
      cqlField: () => this.container().findByLabelText('CQL search string'),
      amountField: () =>
        this.container().findByLabelText('Amount of materials'),
      priorityMaterialTypeField: () =>
        this.container().findByLabelText('Prioritised material type'),
    };
  }

  fillTitle(title: string) {
    this.elements.titleField().type(title);
  }

  fillDescription(description: string) {
    this.elements.descriptionField().type(description);
  }

  fillCql(cql: string) {
    this.elements.cqlField().type(cql, { delay: 0 });
  }

  fillAmount(amount: number) {
    this.elements.amountField().type(`{selectall}${amount}`);
  }

  selectPriorityMaterialType(materialType: string) {
    this.elements.priorityMaterialTypeField().select(materialType);
  }
}

export class MaterialGridManualParagraph extends ParagraphComponent {
  static label = 'Material grid manual';

  constructor(delta: number) {
    super(delta);
    this.addElements = {
      titleField: () =>
        this.container().findByLabelText('Title of the material grid'),
      descriptionField: () =>
        this.container().findByLabelText('Material grid description'),
    };
  }

  fillTitle(title: string) {
    this.elements.titleField().type(title);
  }

  fillDescription(description: string) {
    this.elements.descriptionField().type(description);
  }

  selectWork(workId: string) {
    this.fillWorkId(workId);
  }
}

export class GoMaterialSliderAutomaticParagraph extends ParagraphComponent {
  static label = 'GO Material Slider - Automatic';

  constructor(delta: number) {
    super(delta);
    this.addElements = {
      titleField: () => this.container().findByLabelText('Title'),
      cqlField: () => this.container().findByLabelText('CQL search string'),
      amountField: () =>
        this.container().findByLabelText('Amount of materials'),
    };
  }

  fillTitle(title: string) {
    this.elements.titleField().type(title);
  }

  fillCql(cql: string) {
    this.elements.cqlField().type(cql, { delay: 0 });
  }

  fillAmount(amount: number) {
    this.elements.amountField().type(`{selectall}${amount}`);
  }
}

export class GoMaterialSliderManualParagraph extends ParagraphComponent {
  static label = 'GO Material Slider - Manual';

  constructor(delta: number) {
    super(delta);
    this.addElements = {
      titleField: () => this.container().findByLabelText('Title'),
    };
  }

  fillTitle(title: string) {
    this.elements.titleField().type(title);
  }

  selectWork(workId: string) {
    this.fillWorkId(workId);
  }
}

export class GoLinkboxParagraph extends ParagraphComponent {
  static label = 'GO Linkbox';

  constructor(delta: number) {
    super(delta);
    this.addElements = {
      titleField: () => this.container().findByLabelText('Title'),
      descriptionField: () => this.container().findByLabelText('Description'),
      // The linkbox links through a GO link paragraph, which the form adds.
      linkUrlField: () => this.container().findByLabelText('URL'),
      linkTextField: () => this.container().findByLabelText('Link text'),
    };
  }

  fillTitle(title: string) {
    this.elements.titleField().type(title);
  }

  fillDescription(description: string) {
    this.elements.descriptionField().type(description);
  }

  fillLink(url: string, text: string) {
    this.elements.linkUrlField().type(url);
    this.elements.linkTextField().type(text);
  }
}
