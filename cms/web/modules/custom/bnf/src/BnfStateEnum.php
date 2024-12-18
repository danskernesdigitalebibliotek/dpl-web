<?php

namespace Drupal\bnf;

/**
 * BNF states, adding meta data to entities and their BNF history.
 */
enum BnfStateEnum: int {

  // Nothing has happened, related to BNF.
  case Undefined = 0;

  case Imported = 1;

  case Exported = 2;

  const FIELD_NAME = 'bnf_state';
}
