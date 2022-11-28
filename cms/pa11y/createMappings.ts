import { wiremock } from "./lib/general";
import createCommonMappings from "./mappings/common/createCommonMappings";
import createMappingsForSearch from "./mappings/search/createMappingsForSearch";
import createMappingsForWorkPage from "./mappings/work/createMappingsForWorkPage";

const create = async () => {
  await wiremock().mappings.deleteAllMappings();
  // Create common mappings.
  createCommonMappings();

  // Create page specific mappings.
  createMappingsForSearch();
  createMappingsForWorkPage();
};

create();
