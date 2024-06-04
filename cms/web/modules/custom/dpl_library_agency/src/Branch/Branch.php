<?php

namespace Drupal\dpl_library_agency\Branch;

/**
 * Value object representing a branch in an agency.
 *
 * In this context the branch is a library (typically with a physical location)
 * within a library organization (typically a municipality).
 *
 * A branch is identified by an id which will typically be an ISIL code.
 * See https://vip.dbc.dk/lister.php?vis=folk_alle for a full list.
 *
 * Example: The branch Nørrebro Bibliotek in the Copenhagen libraries has
 * the following values:
 *
 * Title: Nørrebro Bibliotek
 * Id: DK-710111
 */
class Branch {

  /**
   * Constructor.
   *
   * @param string $id
   *   The id of the library. Typically an ISIL code.
   * @param string $title
   *   The title of the library.
   */
  public function __construct(
    public string $id,
    public string $title,
  ) {}

}
