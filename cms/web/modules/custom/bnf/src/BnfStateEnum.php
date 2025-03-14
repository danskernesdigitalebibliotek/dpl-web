<?php

namespace Drupal\bnf;

/**
 * BNF states, adding metadata to entities and their BNF history.
 */
enum BnfStateEnum: int {

  // Nothing has happened, related to BNF.
  case None = 0;

  case Imported = 1;

  case Exported = 2;

  // The content has been imported from a third party source (such as BNF), but
  // the local editor has decided to "claim"/"own" the content - meaning no
  // updates will be applied automatically from the third party.
  case LocallyClaimed = 3;

  const FIELD_NAME = 'bnf_state';
}
