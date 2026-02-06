/*
* This script is used to create wiremock mappings used by pa11y tests.
*/
import { wiremock } from "./lib/general";
import createCommonMappings from "./mappings/common/createCommonMappings";
import createMappingsForReservation from "./mappings/reservation/createMappingsForReservation";
import createMappingsForAdvancedSearch from "./mappings/search/createMappingsForAdvancedSearch";
import createMappingsForSearch from "./mappings/search/createMappingsForSearch";
import createMappingsForWorkPage from "./mappings/work/createMappingsForWorkPage";

const create = async () => {
  await wiremock().mappings.deleteAllMappings();
  // Create common mappings.
  createCommonMappings();

  // Create page specific mappings.
  createMappingsForSearch();
  createMappingsForAdvancedSearch();
  createMappingsForWorkPage();
  createMappingsForReservation();
};

create();
