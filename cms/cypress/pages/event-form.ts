import { PageObject, Elements } from '@hammzj/cypress-page-object';
import * as dayjs from 'dayjs';
import { typeInCkEditor } from '../helpers/helper-ckeditor';
import { mediaLibrarySelect } from '../helpers/helper-media';
import { addParagraph } from '../helpers/helper-paragraph';
import { EventLocationComponent } from './event-location';

type WeeklyRecurrence = {
  // The first and last day of the recurrence.
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
  // As the time selects list them, e.g. "09:00 am". Left at the form's
  // defaults when not given.
  startTime?: string;
  endTime?: string;
  days: Weekday[];
};

type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/**
 * The event series form, which is the same when adding and editing.
 */
export class EventFormPage extends PageObject {
  public elements: Elements;

  constructor(path: string) {
    super({ path });
    this.addElements = {
      titleField: () => cy.findByLabelText('Title'),
      subtitleField: () => cy.findByLabelText('Subtitle'),
      recurTypeField: () => cy.findByLabelText('Recur Type'),
      branchField: () => cy.findByLabelText('Branch'),
      customDate: () => cy.get('#edit-custom-date-wrapper'),
      customFromDateField: () =>
        this.elements
          .customDate()
          .findByText('Start date')
          .siblings()
          .findByLabelText('Date'),
      customFromTimeField: () =>
        this.elements
          .customDate()
          .findByText('Start date')
          .siblings()
          .findByLabelText('Time'),
      customToDateField: () =>
        this.elements
          .customDate()
          .findByText('End date')
          .siblings()
          .findByLabelText('Date'),
      customToTimeField: () =>
        this.elements
          .customDate()
          .findByText('End date')
          .siblings()
          .findByLabelText('Time'),
      allDayField: () => cy.findByLabelText('All day'),
      // The other recurrence types have fields with the same labels.
      weekly: () => cy.get('#edit-weekly-recurring-date-wrapper'),
      weeklyFromDateField: () =>
        this.elements
          .weekly()
          .findByText('Create Events Between')
          .siblings()
          .findByLabelText('Date'),
      weeklyToDateField: () =>
        this.elements
          .weekly()
          .findByText('And')
          .siblings()
          .findByLabelText('Date'),
      weeklyStartTimeField: () =>
        this.elements.weekly().findByLabelText('Event Start Time'),
      weeklySetEndTimeField: () =>
        this.elements.weekly().findByLabelText('Set End Time'),
      weeklyEndTimeField: () =>
        this.elements.weekly().findByLabelText('Event End Time'),
      weeklyDayField: (day: string) =>
        this.elements
          .weekly()
          .findByLabelText(day.charAt(0).toUpperCase() + day.slice(1)),
      // Its name says whether it will show or hide the sidebar.
      sidebarOpenButton: () =>
        cy.findByRole('button', { name: /(Show|Hide) sidebar panel/ }),
      sidebarCloseButton: () =>
        cy.findByRole('button', { name: 'Close sidebar panel' }),
      section: (name: string) =>
        cy.findByText(name, { selector: 'summary' }).parent(),
      // Multi-value fields, which number each value in the label.
      placeField: () => cy.findByLabelText(/^Place/),
      partnerField: () =>
        this.elements.section('Partners').findByLabelText(/^Partners/),
      stateField: () =>
        this.elements.section('Event details').findByLabelText('State'),
      ticketCapacityField: () =>
        this.elements
          .section('Tickets')
          .findByLabelText('Total ticket capacity'),
      addTicketCategoryButton: () =>
        this.elements
          .section('Tickets')
          .findByRole('button', { name: 'Add Ticket category' }),
      ticketCategoryNameField: () =>
        this.elements.section('Tickets').findByLabelText('Name'),
      ticketCategoryPriceField: () =>
        this.elements.section('Tickets').findByLabelText('Price'),
      ticketManagerField: () =>
        this.elements
          .section('Tickets')
          .findByLabelText('Relevant for ticket manager'),
      ticketLinkField: () =>
        this.elements.section('Tickets').findByLabelText('Ticket link'),
      // Scoped, as other parts of the form use the same labels.
      categoryField: () =>
        this.elements.section('Tagging').findByLabelText('Categories'),
      audienceField: () =>
        this.elements.section('Event details').findByLabelText('Audiences'),
      tagField: () => this.elements.section('Tagging').findByLabelText('Tags'),
      paragraphsModalButton: () =>
        cy.findAllByTitle('Show all Paragraphs').first(),
      confirmDateChangesButton: () =>
        cy.findByRole('button', { name: 'Confirm Date Changes' }),
      saveButton: () =>
        cy
          .get('#edit-gin-sticky-actions')
          .findByRole('button', { name: /Save/i }),
    };
  }

  fillTitle(title: string) {
    this.elements.titleField().clear();
    this.elements.titleField().type(title);
  }

  fillSubtitle(subtitle: string) {
    this.elements.subtitleField().clear();
    this.elements.subtitleField().type(subtitle);
  }

  fillBody(body: string) {
    typeInCkEditor(body);
  }

  selectRecurType(recurType: string) {
    // We have to use force when using Select2.
    this.elements.recurTypeField().select(recurType, { force: true });
  }

  selectBranch(branch: string) {
    this.elements.branchField().select(branch, { force: true });
  }

  selectState(state: string) {
    this.elements.stateField().select(state, { force: true });
  }

  /**
   * Sets the date of an event with a single occurrence.
   */
  fillSingleDate(start: dayjs.Dayjs, end: dayjs.Dayjs) {
    this.fillStartDate(start);
    this.fillEndDate(end);
  }

  fillStartDate(start: dayjs.Dayjs) {
    this.elements.customFromDateField().type(start.format('YYYY-MM-DD'));
    this.elements.customFromTimeField().type(start.format('HH:mm'));
  }

  fillEndDate(end: dayjs.Dayjs) {
    this.elements.customToDateField().type(end.format('YYYY-MM-DD'));
    this.elements.customToTimeField().type(end.format('HH:mm'));
  }

  toggleAllDay() {
    this.elements.allDayField().click();
  }

  fillWeeklyRecurrence({
    from,
    to,
    startTime,
    endTime,
    days,
  }: WeeklyRecurrence) {
    this.selectRecurType('Weekly Event');
    this.elements.weeklyFromDateField().type(from.format('YYYY-MM-DD'));
    this.elements.weeklyToDateField().type(to.format('YYYY-MM-DD'));
    if (startTime) {
      this.elements.weeklyStartTimeField().select(startTime);
    }
    if (endTime) {
      this.elements.weeklySetEndTimeField().check();
      this.elements.weeklyEndTimeField().select(endTime);
    }
    days.forEach((day) => this.elements.weeklyDayField(day).check());
  }

  /**
   * Changes the last day of a weekly recurrence.
   */
  changeWeeklyEndDate(to: dayjs.Dayjs) {
    this.elements.weeklyToDateField().clear();
    this.elements.weeklyToDateField().type(to.format('YYYY-MM-DD'));
  }

  /**
   * Picks the event image and teaser image from the media library.
   */
  selectImages(eventImage: string, teaserImage: string) {
    // Searching the media library submits the search twice, and the browser
    // aborts the first request. That is harmless, but Drupal reports it.
    Cypress.on(
      'uncaught:exception',
      (error) => !error.message.includes('ReadyState: 0'),
    );
    // The images are in the sidebar, which is collapsed on narrow screens.
    this.elements.sidebarOpenButton().click();
    mediaLibrarySelect(
      '#field_event_image-media-library-wrapper',
      eventImage,
      0,
      /^\/events\//,
    );
    mediaLibrarySelect(
      '#field_teaser_image-media-library-wrapper',
      teaserImage,
      1,
      /^\/events\//,
    );
    this.elements.sidebarCloseButton().click();
  }

  fillPlace(place: string) {
    this.elements.placeField().type(place);
  }

  fillTicketCapacity(capacity: number) {
    this.openSection('Tickets');
    this.elements.ticketCapacityField().type(String(capacity));
  }

  addTicketCategory(name: string, price: number) {
    this.openSection('Tickets');
    this.elements.addTicketCategoryButton().click();
    // Only a single category is supported for now.
    this.elements.ticketCategoryNameField().type(name);
    this.elements.ticketCategoryPriceField().type(String(price));
  }

  /**
   * Links to where tickets are sold, instead of using a ticket manager.
   */
  fillExternalTicketLink(url: string) {
    this.openSection('Tickets');
    this.elements.ticketManagerField().uncheck();
    this.elements.ticketLinkField().type(url);
  }

  fillPartner(partner: string) {
    this.openSection('Partners');
    this.elements.partnerField().type(partner);
  }

  selectCategory(category: string) {
    this.elements.categoryField().select(category, { force: true });
  }

  selectAudience(audience: string) {
    this.elements.audienceField().select(audience, { force: true });
  }

  selectTag(tag: string) {
    this.elements.tagField().select(tag, { force: true });
  }

  addParagraph(type: string) {
    this.elements.paragraphsModalButton().click();
    addParagraph(type);
  }

  location() {
    return new EventLocationComponent();
  }

  save() {
    this.elements.saveButton().click();
  }

  /**
   * Saving a series whose recurrence changed puts the form into a second step,
   * which has to be confirmed before the change is applied.
   */
  saveAndConfirmDateChanges() {
    this.save();
    this.elements.confirmDateChangesButton().click({
      // The sticky Gin action bar can overlap the inline confirm button.
      force: true,
    });
  }

  /**
   * Opens a collapsible section of the form, unless it is already open.
   */
  openSection(name: string) {
    this.elements.section(name).then(($details) => {
      if (!$details.prop('open')) {
        cy.wrap($details).children('summary').click();
      }
    });
  }
}
