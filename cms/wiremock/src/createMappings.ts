/*
* This script is used to create wiremock mappings used by pa11y tests.
*/
import { wiremock } from "./lib/general";
import createCommonMappings from "./mappings/common/createCommonMappings";
import createMappingsForReservation from "./mappings/reservation/createMappingsForReservation";
import createMappingsForAdvancedSearch from "./mappings/search/createMappingsForAdvancedSearch";
import createMappingsForSearch from "./mappings/search/createMappingsForSearch";
import createMappingsForWorkPage from "./mappings/work/createMappingsForWorkPage";

// Mappings are created strictly sequentially (here and inside each
// createMappings* function). wiremock's admin API loses stub registrations when
// hit with many concurrent POSTs - it answers 201 but a subset never ends up in
// the store - which left CI with missing mappings (e.g. getMaterial -> 404 on
// the work page) while a faster local machine happened to register them all.
const create = async () => {
  await wiremock().mappings.deleteAllMappings();
  // Create common mappings.
  await createCommonMappings();

  // Create page specific mappings.
  await createMappingsForSearch();
  await createMappingsForAdvancedSearch();
  await createMappingsForWorkPage();
  await createMappingsForReservation();
};

create().catch((error) => {
  console.error("Failed to create wiremock mappings:", error);
  // Re-throw so the Node process exits with a non-zero status (an unhandled
  // rejection). Avoids depending on `process` typings in the wiremock tsconfig.
  throw error;
});
