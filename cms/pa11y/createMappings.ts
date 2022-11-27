import { availabilityMapping, coverMapping, materialListMapping, userTokenMapping } from "./lib/commonMappings";
import { wiremock } from "./lib/general";
import createMappingsForSearch from "./search/createMappingsForSearch";
import createMappingsForWorkPage from "./work/createMappingsForWorkPage";

const create = async () => {

  await wiremock().mappings.deleteAllMappings();
  // Create common mappings.
  // Get cover.
  coverMapping();
   // Get material list.
   materialListMapping();
   // Get user-tokens.
   userTokenMapping();
   // Get availability.
   availabilityMapping();

   // Create page specific mappings.
  createMappingsForSearch();
  createMappingsForWorkPage();
};

create();


