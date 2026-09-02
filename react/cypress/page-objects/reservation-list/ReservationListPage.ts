import {
  PageObject,
  Elements,
  NestedComponents
} from "@hammzj/cypress-page-object";
import { ReservationRowComponent } from "./components/reservation-row";
import { ReservationDetailsModalComponent } from "./components/reservation-details-modal";
import { DeleteReservationModalComponent } from "./components/delete-reservation-modal";

/**
 * The reservation list stories. `withBiblioAdapter` is the same app with the
 * CMS feature flag turned on, where digital reservations combine Publizon and
 * Biblio.
 */
export const reservationListStory = {
  default: "reservation-list-entry",
  withBiblioAdapter: "reservation-list-with-biblio-adapter",
  // TEMPORARY: the Publizon queue frozen while Biblio migrates it, where the
  // reservations it holds cannot be cancelled - see the story.
  withClosedPublizonReservations:
    "reservation-list-with-closed-publizon-reservations"
} as const;

export class ReservationListPage extends PageObject {
  public elements!: Elements;

  public components!: NestedComponents;

  constructor(story: string = reservationListStory.default) {
    super({
      path: `/iframe.html?path=/story/apps-reservation-list--${story}`
    });

    this.elements = {
      // One header per group (ready for pickup, queued, …), each carrying its
      // own count.
      headers: () => cy.get("[data-cy='reservation-list-header']")
    };

    this.addNestedComponents = {
      ReservationRow: (fn, index = 0) =>
        this.performWithin(
          this.container(),
          new ReservationRowComponent(index as number),
          fn
        )
    };
  }

  /**
   * A reservation row addressed directly rather than through
   * `components.ReservationRow`, for interactions that open something
   * portaled outside the page container.
   */
  reservationRow(index = 0) {
    return new ReservationRowComponent(index);
  }

  // Both modals are portaled to document.body, so they are exposed directly
  // rather than as nested components scoped inside the page container.
  detailsModal() {
    return new ReservationDetailsModalComponent();
  }

  deleteModal() {
    return new DeleteReservationModalComponent();
  }
}
