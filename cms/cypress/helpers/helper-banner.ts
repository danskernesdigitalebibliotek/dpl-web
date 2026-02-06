import { typeInCkEditor } from './helper-ckeditor';
import { mediaLibrarySelect } from './helper-media';
import { addParagraph } from './helper-paragraph';

type AddBannerOptionsType = {
  bannerContent: {
    title: string;
    description: string;
    link: string;
  };
  openInNewTab?: boolean;
};

export const addAndSaveBannerParagraph = ({
  bannerContent,
  openInNewTab = false,
}: AddBannerOptionsType) => {
  addParagraph('Banner');
  cy.findByLabelText('Banner Link').type(bannerContent.link);
  if (openInNewTab) {
    cy.findByLabelText('Open link in new window/tab').check();
  }
  typeInCkEditor(bannerContent.title);
  cy.findByLabelText('Banner description').type(bannerContent.description);
  mediaLibrarySelect(
    '#field_banner_image-media-library-wrapper-field_paragraphs-0-subform',
    'paige-cody',
  );
  cy.clickSaveButton();
};

type BannerVerificationOptions = {
  link: string;
  title: string;
  description: string;
  underlineText?: string;
  openInNewTab?: boolean;
};

export const verifyBannerParagraph = ({
  link,
  title,
  description,
  underlineText,
  openInNewTab = false,
}: BannerVerificationOptions) => {
  cy.get('.banner')
    .should('have.attr', 'style')
    .and('match', /background-image: url\(.+paige-cody.+\)/);

  cy.get('.banner').should('have.attr', 'href', link);
  if (openInNewTab) {
    cy.get('.banner').should('have.attr', 'target', '_blank');
  }

  cy.get('.banner__title').should('contain', title);
  if (underlineText) {
    cy.get('.banner__title').within(() => {
      cy.get('u').should('contain.text', underlineText);
    });
  }

  cy.get('.banner__content').should('contain', description);
};
