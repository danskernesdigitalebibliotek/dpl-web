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

  it("Adds 'Material Grid Automatic' paragraph and verifies AJAX logic", () => {
    const paragraphTitle = 'Material grid automatic';

    addParagraph(paragraphTitle);

    cy.get('[data-drupal-selector="edit-field-paragraphs-0-subform"]').as(
      'subform',
    );

    cy.get('@subform')
      .find('summary')
      .contains('Fill out fields using link (optional)')
      .as('linkDetails');
    cy.get('@subform').findByLabelText('Link to search').as('linkField');
    cy.get('@subform')
      .find('.button[value="Load filters from URL"]')
      .as('loadFiltersField');
    cy.get('@subform').findByLabelText('Sorting').as('sortField');
    cy.get('@subform').findByLabelText('CQL search string').as('cqlField');
    cy.get('@subform').findByLabelText('Location').as('locationField');
    cy.get('@subform').findByLabelText('Sub-location').as('sublocationField');
    cy.get('@subform').findByLabelText('On-shelf').as('onshelfField');
    cy.get('@subform').findByLabelText('Branch').as('branchField');
    cy.get('@subform').findByLabelText('Department').as('departmentField');

    cy.get('@sortField').should(
      'have.value',
      'sort.latestpublicationdate.desc',
    );
    cy.get('@cqlField').should('be.empty');
    cy.get('@locationField').should('be.empty');
    cy.get('@sublocationField').should('be.empty');
    cy.get('@onshelfField').should('not.be.checked');
    cy.get('@branchField').should('be.empty');
    cy.get('@departmentField').should('be.empty');

    // Testing that link input updates the filters, and that a relative link
    // also works.
    cy.get('@linkField').type(
      "/advanced-search?sort=sort.latestpublicationdate.asc&onshelf=true&location=børn&sublocation=fantasy&advancedSearchCql=+term.title%3D'Harry+Potter'+AND+term.creator%3D+'J.K.+Rowling'+AND+(+term.generalmaterialtype%3D'bøger'+OR+term.generalmaterialtype%3D'e-bøger')+AND+term.fictionnonfiction%3D'fiction'&branch=710111&department=voksen",
      { delay: 0 },
    );
    cy.get('@loadFiltersField').click();

    // Testing that the link field has been emptied and hidden.
    cy.get('@linkField').should('have.value', '').should('not.be.visible');

    cy.get('@sortField').should('have.value', 'sort.latestpublicationdate.asc');
    cy.get('@cqlField').should(
      'have.value',
      "term.title='Harry Potter' AND term.creator= 'J.K. Rowling' AND ( term.generalmaterialtype='bøger' OR term.generalmaterialtype='e-bøger') AND term.fictionnonfiction='fiction'",
    );
    cy.get('@locationField').should('have.value', 'børn');
    cy.get('@sublocationField').should('have.value', 'fantasy');
    cy.get('@branchField').should('have.value', '710111');
    cy.get('@departmentField').should('have.value', 'voksen');
    cy.get('@onshelfField').should('be.checked');

    // Testing that new input takes precedence, that an absolute link
    // also works, and that an accidental extra space doesn't break the CQL.
    cy.get('@linkDetails').click();
    cy.get('@linkField').type(
      "www.google.com/?advancedSearchCql='Harry+Potter'\r\n",
      { delay: 0 },
    );
    cy.get('@loadFiltersField').click();

    cy.get('@sortField').should('have.value', 'relevance');
    cy.get('@cqlField').should('have.value', "'Harry Potter'");
    cy.get('@locationField').should('be.empty');
    cy.get('@sublocationField').should('be.empty');
    cy.get('@branchField').should('be.empty');
    cy.get('@departmentField').should('be.empty');
    cy.get('@onshelfField').should('not.be.checked');

    // Re-sets all the values.
    cy.get('@linkDetails').click();
    cy.get('@linkField').type(
      "/advanced-search?sort=sort.creator.desc&onshelf=true&location=børn&sublocation=fantasy&advancedSearchCql='Harry%20Potter'",
      { delay: 0 },
    );
    cy.get('@loadFiltersField').click();
    cy.get('@cqlField').should('have.value', "'Harry Potter'");

    cy.clickSaveButton();

    // Checking that the react app has been created as expected.
    // We won't check if the values are actually respected, because that is
    // something that should be tested as part of dpl-react.
    cy.get(
      '[data-dpl-app=material-grid-automatic]' +
        '[data-cql="\'Harry Potter\'"]' +
        '[data-location="børn"]' +
        '[data-sublocation="fantasy"]' +
        '[data-onshelf="true"]' +
        '[data-sort="sort.creator.desc"]',
    ).should('exist');
  });
});
