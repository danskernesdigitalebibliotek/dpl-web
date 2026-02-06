# Page objects in Cypress tests

When writing Cypress tests you're trying turn something very abstract
(a wish to test something) into something very specific (the exact
interactions with the browser DOM), so naturally a given test will
contain a lot of implementation detail.

However, in this process, the original intent of the test ("test that
the user can reserve a material") gets replaced with the
implementation details ("click the button with id 'reserve-12649846'
and check that the div with id 'messages' contains the text 'Reserved
Harry Potter and the Goblet of Fire'").

This can make a test difficult to read, and it skips a level of
abstraction humans are very familiar with ("go to this page, click the
reserve button").

The "Page Object Model" (commonly known as "POM") adds in this
abstraction and promotes reuse across tests.

## Anatomy of a page object

A page object can consist of:

* Elements: More specific names for elements on the page. They allow
  the page object to expose an element to the test (`headline()` for
  instance), without exposing the specifics
  (`div[data-type=headline]`). Be careful with elements that might
  bleed implementation details, like a `<select>` element.
* Components: Like page objects for parts of pages. Useful for more
  advanced UI components that might be shared across pages.
* Action and query methods: The interface to this page, basically
  names "what can you do" and "what can you see" on this page.

## Using page objects

Basic usage of a page object is straightforward, a cut down example:

```javascript
import { AdminModulesPage } from '../pages/admin-modules';
import { InstallOrUpdatePage } from '../pages/install-or-update';

describe('Webmaster', () => {
  it('can upload and enable a module', () => {
    const installOrUpdatePage = new InstallOrUpdatePage();
    installOrUpdatePage.visit([]);
    installOrUpdatePage.uploadModule(
      'cypress/fixtures/test_module/v1.0.0/test_module.tar.gz',
    );

    const adminModulesPage = new AdminModulesPage();
    adminModulesPage.visit([]);
    adminModulesPage.moduleExists('test_module').should('be.true');
    adminModulesPage.moduleEnabled('test_module').should('be.false');
  });
});
```

After instantiating the page object, call `visit()` to make Cypress go
to the page. Page objects always assume the browser is currently on
the right page, which is why `visit()` is needed, but a page object
can opt to return a new page object if doing an action that causes
navigation in the browser.

One of the most common pitfalls of page objects is confusion stemming
from having a page object for one page, but the browser being on
another page, so look out for that. If there's a good chance that this
happens in a test, there's `page_object.assertIsOnPage()` that can
assure the right page is current, but it's generally not needed as the
test should fail anyway.

The real interaction with the page is mostly done through "action"
methods, like `installOrUpdatePage.uploadModule()` in the above
example, or "query" methods like `adminModulesPage.moduleExists()`. Or
for simpler pages, just using the elements.

## Implementing a page object

Our page objects are based on
[cypress-page-object](https://github.com/hammzj/cypress-page-object),
which provides a good base class for page objects.

An example (edited for brevity):

```javascript
import { PageObject, Elements } from '@hammzj/cypress-page-object';

export class AdminModulesPage extends PageObject {
  public elements: Elements;

  constructor() {
    super({ path: '/admin/modules' });
    this.addElements = {
      table: () => cy.get('table.module-list'),
      submit: () => cy.findByRole('button', { name: /Install/i }),
      moduleCheckbox: (module: string) =>
        this.elements.table().find(this.moduleCheckboxId(module)),
    };
  }

  enableModule(module: string) {
    this.elements.moduleCheckbox(module).check();
    this.elements.submit().click();

    return this;
  }

  /**
   * Check if module exists.
   *
   * Yields true or false.
   */
  moduleExists(module: string) {
    return this.elements
      .table()
      .then(($table) => $table.find(this.moduleCheckboxId(module)).length > 0);
  }

  /**
   * Get module checkbox HTML ID.
   *
   * Drupal munges the module name a bit in the ID attribute.
   */
  moduleCheckboxId(module: string): string {
    return '#edit-modules-' + module.replace('_', '-') + '-enable';
  }
}
```

### Commentary

The constructor calls `super()` to tell the base page object the URL
of the page. Placeholders can be used, consult the
[documentation](https://github.com/hammzj/cypress-page-object?tab=readme-ov-file#example-1-a-path-with-variables-to-replace)
for details.

The constructor also registers the common elements. It is advisable to
use the [findByRole/findByLabelText/etc.
functions](https://testing-library.com/docs/queries/about/#priority)
added by
[testing-library](https://testing-library.com/docs/cypress-testing-library/intro/)
to mimic how acutal users are using the page.

The `enableModule()` method is an action. As demonstrated, using the
page elements improves readability. Actions aren't required to return
anything, but returning `this` or in the case of something that does
navigation, a page object for the new page aids chain-ability.

Keep an eye on the needs of the tests that'll end up using your
actions. For instance, if enabling modules would send the user to a
confirmation page, the most proper thing would be for `enableModule()`
to return a page object for the confirmation page. But if the most
usage of the action is to enable a module for testing of things
unrelated to the module enabling flow, it would be more handy for
`enableModule()` to just deal with the confirmation.

Query methods like `moduleExists()` ought to return something
chain-able, to keep with the Cypress style. In this case we're
returning a boolean from `.then()`, which Cypress then turns into
something you can call `.should('be.true');` on.

### General tips

When implementing page objects, think of how you'd instruct a
knowledgeable user in using the page.

While the idea of page objects is to be a general interface to a page,
resist the temptation to implement actions/queries before you have a
test that need them, but, as always, keep an eye on future extension.

And don't get too hung up on doing the page object "properly". A
funky, but working, page object is more valuable than a non-existing
ideal. And when you have a passing test, you can use it to ensure that
your refactoring of the page object still works as inteded.
