<?php

namespace Drupal\dpl_das\Elba;

use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\RequestOptions;
use Symfony\Component\Serializer\Encoder\EncoderInterface;

/**
 * Client for Elba webservices.
 *
 * These web services are provided by the Royal Danish Library.
 *
 * @see https://webservice.statsbiblioteket.dk/elba-webservices/
 */
class Client {

  /**
   * Constructor.
   */
  public function __construct(
    private ClientInterface $client,
    private EncoderInterface $encoder,
    // Note that the uri is all lower case despite the provided documentation.
    // This is intentional and required for the service to work.
    private string $uri = "https://webservice.statsbiblioteket.dk/elba-webservices/services/placecopyrequest",
  ) {}

  /**
   * Order a digital copy of an article to be sent to the patron by email.
   */
  public function placeCopy(PlaceCopyRequest $placeCopy): void {
    // The XML encoder does not provide a way to add a namespace to objects.
    // Convert it to an array to fix this.
    $request = (array) $placeCopy;
    $request['@xmlns'] = "http://statsbiblioteket.dk/xws/elba-placecopyrequest-schema";

    $xml = $this->encoder->encode($request, "xml", [
      // Existing integrations use XML 1.0. Keep doing to for consistency.
      "xml_version" => "1.0",
      "xml_encoding" => "utf-8",
      "xml_root_node_name" => "placeCopyRequest",
    ]);

    try {
      $this->client->send(new Request(
        "POST",
        $this->uri,
        // Content type matches encoding.
        ["Content-Type" => "application/xml; charset=UTF8"],
        $xml
      ), [
        // This is intentionally set high because the service is known to be
        // slow. Typical response times are about 10 seconds.
        RequestOptions::TIMEOUT => 30,
      ]);
    }
    catch (GuzzleException $e) {
      throw new Exception($e);
    }
  }

}
