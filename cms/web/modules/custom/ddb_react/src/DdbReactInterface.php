<?php

namespace Drupal\ddb_react;

/**
 * Interface for ddb_react constants.
 */
interface DdbReactInterface {

  // @todo Consider making this configurable.
  const DDB_REACT_FOLLOW_SEARCHES_URL = 'https://prod.followsearches.dandigbib.org';
  // @todo Consider making this configurable.
  const DDB_REACT_MATERIAL_LIST_URL = 'https://prod.materiallist.dandigbib.org';
  // @todo Consider making this configurable.
  const DDB_REACT_COVER_SERVICE_URL = 'https://cover.dandigbib.org/api/v2';

}
