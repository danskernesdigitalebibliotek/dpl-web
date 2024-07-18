import "cypress-if";

const node = {
  title: "Varnish test",
  subtitle: "A subtitle",
  path: "/articles/varnish-test",
};

const varnishCacheHeader = "x-varnish-cache";

describe("Varnish", () => {
  it("is caching responses for anonymous users", () => {
    cy.anonymousUser();
    // Query the front page twice to ensure that Varnish has had a chance to
    // cache the response.
    cy.request("/");
    cy.request("/").then((response) => {
      cy.log("Headers", response.headers);
      expect(response.headers).to.have.property(varnishCacheHeader, "HIT");
    });
  });

  it("is purged when updating content", () => {
    // Create a node as admin.
    cy.drupalLogin("/node/add/article");
    cy.findByLabelText("Title").type(node.title);
    cy.findByRole("button", { name: "Save" }).click();
    cy.contains(node.title);
    cy.should("not.contain", node.subtitle);
    // We do not have a good way to store the current path between tests so
    // instead we ensure that the expected path is correct.
    cy.url().should("include", node.path);

    // Check that the node is accessible and rendered with the expected content
    // for anonymous users.
    cy.anonymousUser();
    cy.visit(node.path);
    cy.contains(node.title);
    cy.should("not.contain", node.subtitle);

    // Edit the page as admin and ensure that it is updated.
    cy.drupalLogin();
    cy.visit(node.path);
    cy.findByRole("link", {
      name: `Edit ${node.title}`,
    }).click({
      // Use force as the toolbar may cover the Edit link.
      force: true,
    });
    cy.findByLabelText("Subtitle").type(node.subtitle);
    cy.findByRole("button", { name: "Save" }).click();
    cy.contains(node.title);
    cy.contains(node.subtitle);

    // Ensure that the cache is purged and update shown immediately to
    // anonymous users.
    cy.anonymousUser();
    cy.request(node.path).then((response) => {
      cy.log("Headers", response.headers);
      expect(response.headers).to.have.property(varnishCacheHeader, "MISS");
    });
    cy.visit(node.path);
    cy.contains(node.title);
    cy.contains(node.subtitle);
  });

  before(() => {
    cy.drupalLogin("/admin/content");
    // Delete all preexisting instances of the node.
    cy.get("a")
      .contains(node.title)
      .if()
      .each(() => {
        // We have to repeat the selector as Cypress will otherwise complain about
        // missing references to elements when clicking the page.
        cy.findAllByRole("link", { name: node.title }).first().click();
        cy.findByRole("link", {
          name: `Edit ${node.title}`,
        }).click();
        cy.findByRole("button", { name: "More actions" })
          .click()
          .parent()
          .findByRole("link", { name: "Delete" })
          .click();
        cy.findByRole("dialog")
          .findByRole("button", { name: "Delete" })
          .click();

        // Return to the node list to prepare for the next iteration.
        cy.visit("/admin/content");
      });

    cy.anonymousUser();
  });
});
