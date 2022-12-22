<?php

namespace Drupal\dpl_das\Elba;

/**
 * Value object for requests for digital copies of articles.
 *
 * The service supports a range of different values. This only specifies the
 * ones that we need.
 *
 * @see https://webservice.statsbiblioteket.dk/elba-webservices/placeCopyRequest.xsd
 */
class PlaceCopyRequest {

  /**
   * Constructor.
   *
   * @param string $ws_user
   *   The username to use for accessing the service. This is a service account
   *   user name that must be provided by the Royal Danish Library.
   * @param string $ws_password
   *   The password for the service account.
   * @param string $agencyId
   *   The agency id / ISIL number for the library on behalf of which the
   *   article is ordered. e.g. 775100 for the Aarhus City Libraries.
   * @param string $pid
   *   The post id for the article to order a digital copy of.
   *   Example: 870971-tsart:34310815.
   * @param string $userMail
   *   The email of the user to send the digital copy of the article to.
   */
  public function __construct(
    public string $ws_user,
    public string $ws_password,
    public string $agencyId,
    public string $pid,
    public string $userMail
  ) {}

}
