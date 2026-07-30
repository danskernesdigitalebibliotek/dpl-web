import {
  givenGSearchAddresses,
  givenGSearchAddressReverseGeo
} from "../../../cypress/intercepts/gsearch/addresses";
import { givenLocationLatLong } from "../../../cypress/intercepts/geolocation/geolocation";
import { CreatePatronPage } from "../../../cypress/page-objects/create-patron/CreatePatronPage";

describe("Create Patron - Page Objects Integration", () => {
  let createPatronPage: CreatePatronPage;

  beforeEach(() => {
    cy.viewport(1280, 720);

    // Mock branches endpoint
    cy.interceptRest({
      aliasName: "branches",
      url: "**/agencyid/branches",
      fixtureFilePath: "material/branches.json"
    });

    // Initialize page object for each test
    createPatronPage = new CreatePatronPage();
    createPatronPage.visit([]);
  });

  describe("Page Display", () => {
    it("Should display the create patron page title", () => {
      createPatronPage.elements
        .title()
        .shouldContainAll(["Register as patron"]);
      createPatronPage.elements
        .contactInfo()
        .shouldContainAll([
          "Phone number",
          "E-mail *",
          "Receive text messages about your loans, reservations, and so forth"
        ]);
      createPatronPage.elements
        .pincode()
        .shouldContainAll(["New pin *", "Length of 4 characters"]);
      createPatronPage.elements
        .librarySelectButton()
        .shouldContainAll(["Choose library"]);
      createPatronPage.elements.submitButton().shouldContainAll(["Confirm"]);
      createPatronPage.elements.cancelButton().shouldContainAll(["Cancel"]);
    });
  });

  describe("SMS notifications", () => {
    it("Should show the SMS checkbox and keep the phone number optional by default", () => {
      createPatronPage.elements
        .receiveSmsCheckbox()
        .shouldContainAll([
          "Receive text messages about your loans, reservations, and so forth"
        ]);
      // The phone number is optional until the patron opts in to SMS, so the
      // label must not carry the required asterisk.
      createPatronPage.elements
        .phoneNumberLabel()
        .should("have.text", "Phone number");
    });

    it("Should make the phone number required when opting in to SMS", () => {
      createPatronPage.toggleReceiveSms();
      createPatronPage.elements
        .phoneNumberLabel()
        .should("have.text", "Phone number *");
    });

    it("Should hide the SMS checkbox and keep the phone number optional when the library has disabled SMS notifications", () => {
      // Library with textNotificationsEnabledConfig = "0" in the CMS backend.
      const pageWithoutSms = new CreatePatronPage(
        "apps-create-patron--without-sms-notifications"
      );
      pageWithoutSms.visit([]);

      pageWithoutSms.elements.receiveSmsCheckbox().should("not.exist");
      pageWithoutSms.elements
        .phoneNumberLabel()
        .should("have.text", "Phone number");
    });
  });

  describe("Find Library Dialog", () => {
    it("Should open find library dialog when clicking library select", () => {
      createPatronPage.openFindLibraryDialog();
      createPatronPage.verifyFindLibraryDialogIsVisible();
    });

    it("Should display list of libraries with names", () => {
      createPatronPage.openFindLibraryDialog();
      createPatronPage.verifyFindLibraryDialogIsVisible();
      createPatronPage.components.DialogFindLibrary((dialog) => {
        dialog.elements
          .locationList()
          .shouldContainAll([
            "Grønlandsk Bibliotek",
            "Biblioteket Rentemestervej",
            "Sundby",
            "Solvang",
            "Sydhavn",
            "Bibliotekshuset",
            "Valby",
            "Tingbjerg",
            "Vesterbro",
            "Vanløse",
            "Hovedbiblioteket",
            "Vigerslev",
            "Ørestad",
            "Østerbro",
            "Blågården",
            "Christianshavn",
            "Brønshøj",
            "Islands Brygge",
            "Husum",
            "Øbro Jagtvej"
          ]);
      });
    });

    it("Should allow selecting a library from the list", () => {
      createPatronPage.openFindLibraryDialog();
      createPatronPage.verifyFindLibraryDialogIsVisible();
      createPatronPage.components.DialogFindLibrary((dialog) => {
        dialog.elements
          .locationList()
          .shouldContainAll(["Biblioteket Rentemestervej"]);

        dialog.selectLibraryByName("Biblioteket Rentemestervej");
      });
      createPatronPage.verifyDialogIsNotVisible();
      createPatronPage.elements
        .librarySelectButton()
        .shouldContainAll(["Biblioteket Rentemestervej"]);
    });

    it("Should highlight selected library in the list", () => {
      createPatronPage.openFindLibraryDialog();
      createPatronPage.verifyFindLibraryDialogIsVisible();
      createPatronPage.components.DialogFindLibrary((dialog) => {
        dialog.elements
          .locationList()
          .shouldContainAll(["Biblioteket Rentemestervej"]);
        dialog.elements
          .locationListItems()
          .contains("Biblioteket Rentemestervej")
          .click();
      });
      createPatronPage.verifyDialogIsNotVisible();
      createPatronPage.elements
        .librarySelectButton()
        .shouldContainAll(["Biblioteket Rentemestervej"]);
      createPatronPage.openFindLibraryDialog();
      createPatronPage.verifyFindLibraryDialogIsVisible();

      createPatronPage.components.DialogFindLibrary((dialog) => {
        dialog.verifyLocationListHasSelectedLibrary({
          name: "Biblioteket Rentemestervej",
          isSelected: true
        });
      });
    });
  });

  describe("Find Library Dialog through address autocomplete", () => {
    it("Should display the suggestions list when typing in the address input field", () => {
      givenGSearchAddresses();
      createPatronPage.openFindLibraryDialog();
      createPatronPage.verifyFindLibraryDialogIsVisible();
      createPatronPage.components.DialogFindLibrary((dialog) => {
        dialog.typeAddressInInput("Suomisvej");
        dialog.verifyAddressSuggestionListIsVisible();
        dialog.clickFirstAddressSuggestion();
        dialog.verifyAddressSuggestionListIsNotExisting();
        dialog.verifyAddressSuggestionIsInsertedInInput();
      });
    });
  });

  describe("Find Library Dialog through reverse geolocation", () => {
    it("Should display reversed geo location when clicking the reverse geo location button", () => {
      givenGSearchAddresses();
      givenGSearchAddressReverseGeo();
      createPatronPage.openFindLibraryDialog();
      createPatronPage.verifyFindLibraryDialogIsVisible();
      givenLocationLatLong();

      createPatronPage.components.DialogFindLibrary((dialog) => {
        dialog.clickReverseGeoLocationButton();
        dialog.verifyAddressSuggestionListIsNotExisting();
        dialog.verifyReverseLocationIsInsertedInInput();
      });
    });
  });
});

export default {};
