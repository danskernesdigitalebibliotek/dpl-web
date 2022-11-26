import { wiremock } from "./lib/general";
import createMappingsForSearch from "./search/createMappingsForSearch";

const create = async () => {

  await wiremock().mappings.deleteAllMappings();
  createMappingsForSearch();
};

create();


