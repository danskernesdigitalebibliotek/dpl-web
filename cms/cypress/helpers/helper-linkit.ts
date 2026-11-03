// Linkit's autocomplete script throws on the URL fields of the settings forms,
// as it expects to find them in a link field widget. Saving the forms still
// works, so specs that edit them ignore the error.
export const ignoreLinkitUriError = () => {
  Cypress.on(
    'uncaught:exception',
    (error) =>
      !error.message.includes(
        'must have a data-drupal-selector attribute ending in "-uri"',
      ),
  );
};
