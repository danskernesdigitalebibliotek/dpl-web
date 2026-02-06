# Creating a new Cypress test

The following guide will walk you through the process of creating a new Cypress test, using factories and mocking.

## Steps

1. Create a new test file in the `cypress/e2e` directory and give it a descriptive name.
2. Add a `describe` block with a descriptive name for the test section.
3. Then add a `beforeEach` block to set up the test environment, this should include a `cy.visit` to the page you want to test.
4. Run `yarn cypress:open` to open the Cypress test runner.
5. Select the test file you just created and run it.
6. The chosen page path should load, but might fail, as it probably requires some mocking.
7. Look in the terminal for any unhandled request thrown by MockTTP - these are the server side requests which needs to be mocked.
8. Look for any failed network requests inside Cypress - these are the client side requests which needs to be mocked.
9. Create a new factory in `cypress/factories/#matching-service-name#/#data-name#.ts`.
10. Use a matching data type for the factory. This would often come from our generated graphql types in `/lib/graphql/generated/fbi/graphql`.
11. Create your mocked data in the factory, and make sure it matches the incoming data type.
12. Then we can import the factory in the test file and use it to mock the request. This is done by using `cy.mockServerGraphQLQuery` or `cy.mockServerRest`.
13. Run the test again, and look in the Cypress terminal, you should see the requests being intercepted by MockTTP.
14. Now for the client side requests, we can do the exact same thing, but use `cy.interceptGraphQL` or `cy.interceptRest` to mock the client side request.
15. Continue until all requests are mocked, and the test passes.
16. We now have all the required data to run render the page, and we can continue adding tests for functionality and user interaction.

## Example

```typescript
describe("This block has multiple tests", () => {
  beforeEach(() => {
    // Visit the page for each test
    cy.visit("/some-path")

    // Mock the required data for the page, here it will be set for each test
    // intercept server side graphql request
    cy.mockServerGraphQLQuery({
      operationName: "someDefinedOperationName",
      data: someDefinedFactory.build(),
    })

    // intercept client side graphql request
    cy.interceptGraphQL({
      operationName: "someOtherDefinedOperationName",
      data: someOtherDefinedFactory.build(),
    })
  })

  it("This test does something specific", () => {
    // Do some testing on the page
    cy.get("some-element").should("be.visible")
  })

  it("This test does something else, but with different mocked data", () => {
    // override mocked data for this test
    cy.mockServerGraphQLQuery({
      operationName: "someOtherDefinedOperationName",
      data: someOtherDefinedFactory.build({
        someKey: "someValue",
        someOtherKey: "someOtherValue",
      }),
    })

    // Do some testing on the page
    cy.get("some-other-element").should("be.visible")
  })
})
```
