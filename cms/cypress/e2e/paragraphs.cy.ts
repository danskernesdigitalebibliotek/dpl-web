import {
  addAndSaveBannerParagraph,
  verifyBannerParagraph,
} from '../helpers/helper-banner';
import { typeInCkEditor } from '../helpers/helper-ckeditor';
import { checkImageSrc, mediaLibrarySelect } from '../helpers/helper-media';
import { createTestPageAndOpenParagraphModal } from '../helpers/helper-page';
import { addAnotherParagraph, addParagraph } from '../helpers/helper-paragraph';
import { addSimpleLink, verifySimpleLink } from '../helpers/helper-simplelink';

const pageName = 'Test page';

describe('Paragraphs module', () => {
  beforeEach(() => {
    cy.deleteEntitiesIfExists(pageName);
    createTestPageAndOpenParagraphModal(pageName);
  });

  it("Adds 'Text body' paragraph and verifies CKEditor content", () => {
    addParagraph('Text body');
    typeInCkEditor('Hello, world!');
    cy.clickSaveButton();
    cy.get('.rich-text').should('contain', 'Hello, world!');
  });

  it("Adds 'Media(s)' paragraph with a single image", () => {
    addParagraph('Media(s)');
    mediaLibrarySelect(
      '#field_medias-media-library-wrapper-field_paragraphs-0-subform',
      'paige-cody',
    );
    cy.clickSaveButton();
    checkImageSrc({
      selector: '.medias.medias--single img',
      expectedInSrc: 'paige-cody',
    });
  });

  it("Adds 'Media(s)' paragraph with 2 images", () => {
    addParagraph('Media(s)');
    const images = ['paige-cody', 'robert-collins'];
    images.forEach((img, index) => {
      mediaLibrarySelect(
        '#field_medias-media-library-wrapper-field_paragraphs-0-subform',
        img,
        index,
      );
    });
    cy.clickSaveButton();
    checkImageSrc({
      selector: '.medias__item.medias__item--first img',
      expectedInSrc: 'paige-cody',
    });
    checkImageSrc({
      selector: '.medias__item.medias__item--last img',
      expectedInSrc: 'robert-collins-tvc5imO5pXk-unsplash_0.jpg',
    });
  });

  it("Adds multiple paragraphs: 'Media(s)' and 'Text body'", () => {
    addParagraph('Media(s)');
    mediaLibrarySelect(
      '#field_medias-media-library-wrapper-field_paragraphs-0-subform',
      'paige-cody',
    );
    addAnotherParagraph();
    addParagraph('Text body');
    typeInCkEditor('Hello, world!');
    cy.clickSaveButton();
    checkImageSrc({
      selector: '.medias.medias--single img',
      expectedInSrc: 'paige-cody',
    });
    cy.get('.rich-text').should('contain', 'Hello, world!');
  });

  it("Adds 'Simple links' paragraph with a single link", () => {
    const link = {
      url: 'https://www.google.com/',
      text: 'Google',
      targetBlank: false,
    };
    addParagraph('Simple links');
    addSimpleLink({ link });
    cy.clickSaveButton();
    verifySimpleLink({ link });
  });

  it("Adds 'Simple links' paragraph with an external link", () => {
    const link = {
      url: 'https://www.google.com/',
      text: 'Google',
      targetBlank: true,
    };
    addParagraph('Simple links');
    addSimpleLink({ link });
    cy.clickSaveButton();
    verifySimpleLink({ link });
  });

  it("Adds 'Simple links' paragraph with multiple links", () => {
    const links = [
      { url: 'https://www.google.com/', text: 'Google', targetBlank: false },
      { url: 'https://www.reload.dk/', text: 'Reload', targetBlank: true },
    ];
    addParagraph('Simple links');
    links.forEach((link, index) => addSimpleLink({ link, index }));
    cy.clickSaveButton();
    links.forEach((link, index) => verifySimpleLink({ link, index }));
  });

  it("Adds 'Accordion' paragraph and verifies content toggle", () => {
    const accordionContent = {
      title: 'Accordion title',
      content: 'Accordion content',
    };
    addParagraph('Accordion');
    cy.findByLabelText('Accordion title').type(accordionContent.title);
    typeInCkEditor(accordionContent.content);
    cy.clickSaveButton();
    cy.get('summary.disclosure__headline').should(
      'contain',
      accordionContent.title,
    );
    cy.get('details.disclosure.disclosure--paragraph-width').should(
      'not.have.attr',
      'open',
    );
    cy.get('summary.disclosure__headline').click();
    cy.get('details.disclosure.disclosure--paragraph-width').should(
      'contain',
      accordionContent.content,
    );
    cy.get('details.disclosure.disclosure--paragraph-width').should(
      'have.attr',
      'open',
    );
  });

  it("Adds 'Banner' paragraph and verifies underlined title", () => {
    const bannerContent = {
      title: 'Banner with <u>underlined title</u>',
      description: 'Banner description',
      link: 'https://www.google.com/',
    };

    addAndSaveBannerParagraph({ bannerContent });

    verifyBannerParagraph({
      link: bannerContent.link,
      title: 'Banner with underlined title',
      description: bannerContent.description,
      underlineText: 'underlined title',
    });
  });

  it("Adds 'Banner' paragraph with an external link", () => {
    const bannerContent = {
      title: 'Banner title',
      description: 'Banner description',
      link: 'https://www.google.com/',
    };

    addAndSaveBannerParagraph({ bannerContent, openInNewTab: true });

    verifyBannerParagraph({
      link: bannerContent.link,
      title: bannerContent.title,
      description: bannerContent.description,
      openInNewTab: true,
    });
  });

  it("Adds 'Card grid - Manual' paragraph and verifies 'dynamic_entity_reference'", () => {
    const paragraphTitle = 'Card grid title';
    const links = [
      {
        text: 'Jesper Stein vinder Læsernes Bogpris for Rampen',
        url: '/articles/netmedier/jesper-stein-vinder-laesernes-bogpris-rampen',
      },
      {
        text: 'Bibliotekarerne anbefaler læsning til den mørke tid',
        url: '/articles/bibliotekarerne-anbefaler-laesning-til-den-morke-tid',
      },
      { text: 'Frontpage', url: '/frontpage' },
      {
        text: 'Litterær skovbadning',
        url: '/hovedbiblioteket/articles/klima/litteraer-skovbadning',
      },
      {
        text: '3 gode til godnat 3-6 år',
        url: '/articles/3-gode-til-godnat-3-6-ar',
      },
      {
        text: 'Ny læsesal på Hovedbiblioteket',
        url: '/hovedbiblioteket/articles/litteratur/ny-laesesal-pa-hovedbiblioteket',
      },
    ];

    addParagraph('Card grid - Manual');

    cy.get('[data-drupal-selector="edit-field-paragraphs-0-subform"]')
      .findByLabelText('Title')
      .type(paragraphTitle);

    links.forEach((link, index) => {
      cy.get('input[data-drupal-selector$="-target-id"]')
        .eq(index)
        .type(link.text);
    });

    cy.clickSaveButton();

    cy.get('.card-grid__items a').each(($link, index) => {
      expect($link.attr('href')).to.equal(links[index].url);
    });
  });
});
