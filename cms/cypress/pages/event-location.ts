import { ComponentObject, Elements } from '@hammzj/cypress-page-object';

export type FreetextAddress = {
  street: string;
  postalCode: string;
  postalName: string;
};

/**
 * Where an event takes place, which is on both the series and instance forms.
 */
export class EventLocationComponent extends ComponentObject {
  public elements: Elements;

  constructor() {
    // The form the location fields are on, which is either event form.
    super(() => cy.get('form:has([name="field_event_location_type"])'));
    this.addElements = {
      locationField: () => this.container().findByLabelText('Location name'),
      // The address lookup widget as a whole, which has no name of its own.
      addressWidget: () =>
        this.container().find(
          '[data-drupal-selector="edit-field-event-address-gsearch-wrapper"]',
        ),
      overrideBranchAddressField: () =>
        this.container().findByLabelText('Other location than branch'),
      locationTypeField: (label: string) =>
        this.container().findByRole('radio', { name: label }),
      freetextToggle: () => this.container().findByLabelText('Enable freetext'),
      // The address lookup is labelled "Address" too, but is no textbox. The
      // field is also read while hidden, to check that it was cleared.
      streetField: () =>
        this.container().findByRole('textbox', {
          name: 'Address',
          hidden: true,
        }),
      postalCodeField: () => this.container().findByLabelText('Postal code'),
      postalNameField: () => this.container().findByLabelText('Postal name'),
    };
  }

  selectLocationType(value: 'physical' | 'online' | '_none') {
    const labels = { physical: 'In person', online: 'Online', _none: 'N/A' };
    this.elements.locationTypeField(labels[value]).check();
  }

  overrideBranchAddress() {
    this.elements.overrideBranchAddressField().check();
  }

  fillLocation(location: string) {
    this.elements.locationField().type(location);
  }

  /**
   * Types the address by hand, instead of looking it up in the address
   * register.
   */
  fillFreetextAddress({ street, postalCode, postalName }: FreetextAddress) {
    this.elements.freetextToggle().check();
    this.elements.streetField().clear();
    this.elements.streetField().type(street);
    this.elements.postalCodeField().clear();
    this.elements.postalCodeField().type(postalCode);
    this.elements.postalNameField().clear();
    this.elements.postalNameField().type(postalName);
  }

  /**
   * Yields the address typed by hand.
   */
  freetextAddress() {
    return this.elements.streetField().then(($street) =>
      this.elements.postalCodeField().then(($postalCode) =>
        this.elements
          .postalNameField()
          .then(($postalName): FreetextAddress => ({
            street: String($street.val()),
            postalCode: String($postalCode.val()),
            postalName: String($postalName.val()),
          })),
      ),
    );
  }
}
