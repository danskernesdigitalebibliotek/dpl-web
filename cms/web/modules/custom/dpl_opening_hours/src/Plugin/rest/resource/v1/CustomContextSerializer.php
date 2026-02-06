<?php

namespace Drupal\dpl_opening_hours\Plugin\rest\resource\v1;

use DanskernesDigitaleBibliotek\CMS\Api\Service\JmsSerializer;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\SerializerBuilder;

/**
 * Custom serializer class to handle serialization with a custom context.
 *
 * This serializer extends the JMS Serializer to support custom serialization
 * contexts. The default behavior of the JMS Serializer excludes null values
 * from the response, as it does not accept a $context parameter in the
 * serialize method. However, for the opening_hours_legacy resources, null
 * values need to be included in the response. This class allows passing a
 * custom SerializationContext to include null values in the serialized
 * output, addressing the limitation of the generated serializer code.
 */
class CustomContextSerializer extends JmsSerializer {

  /**
   * Serializes data with a custom serialization context.
   *
   * @param mixed $data
   *   The data to be serialized.
   * @param string $format
   *   The format to serialize the data to (e.g., 'application/json').
   * @param \JMS\Serializer\SerializationContext $context
   *   The custom serialization context to use during serialization.
   *
   * @return string
   *   The serialized data as a string.
   *
   * @throws \InvalidArgumentException
   *   If the format is not recognized.
   */
  public function serializeWithCustomContext(mixed $data, string $format, SerializationContext $context): string {
    $jmsFormat = $this->convertFormat($format);

    return SerializerBuilder::create()->build()->serialize($data, $jmsFormat, $context);
  }

  /**
   * Converts a MIME type format to a format recognized by JMS Serializer.
   *
   * @param string $format
   *   The MIME type format.
   *
   * @return string
   *   The corresponding JMS Serializer format (e.g., 'json', 'xml').
   *
   * @throws \InvalidArgumentException
   *   If the format is not recognized.
   */
  private function convertFormat(string $format): string {
    switch ($format) {
      case 'application/json':
        return 'json';

      case 'application/xml':
        return 'xml';

      default:
        throw new \InvalidArgumentException("Unrecognized format: $format");
    }
  }

}
