import useConfigFlag from "./useConfigFlag";

// TEMPORARY: whether the Publizon reservation queue is frozen for migration.
//
// Biblio needs a period where the queue stands still while it is copied over,
// so during it a patron can neither reserve a digital material through
// Publizon nor cancel one they already have. Loans are untouched - the library
// keeps lending while its queue moves.
//
// Named after the flag the CMS ships it as:
// data-publizon-reservations-closed-config, fed by the Drupal setting
// dpl_biblio.settings:publizon_reservations_closed_react. GO freezes in its own period and
// reads its own flag, so this one only ever answers for the website.
const usePublizonReservationsClosed = (): boolean =>
  useConfigFlag("publizonReservationsClosedConfig");

export default usePublizonReservationsClosed;
