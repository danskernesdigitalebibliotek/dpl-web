<?php

namespace Drupal\dpl_library_agency\Plugin\Field\FieldFormatter;

use Drupal\address_dawa\AddressDawaItemInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;

/**
 * Plugin implementation of the 'dpl_address_dawa_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "dpl_address_dawa_formatter",
 *   label = @Translation("DPL DAWA Adress Formatter"),
 *   field_types = {
 *     "address_dawa"
 *   }
 * )
 */
class AddressDawaFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];

    foreach ($items as $delta => $item) {
      /** @var \Drupal\address_dawa\AddressDawaItemInterface $item */
      $elements[$delta] = $this->buildOutput($item);
    }

    return $elements;
  }

  /**
   * Builds the output for a single item.
   *
   * @return array{
   *   text: string,
   *   postal_code: string|null,
   *   city: string|null,
   *   address: string,
   *   country: string
   *   }
   */
  protected function buildOutput(AddressDawaItemInterface $item): array {
    $dawa_data = $item->getData()['adgangsadresse'];
    $postal_code = $dawa_data?->postnummer?->nr;
    $city = $dawa_data?->postnummer?->navn;

    // Rather than building the whole address string ourselves, we'll
    // just take the pre-built one, and remove the city info.
    $address = str_replace(" $postal_code $city", '', $item->getTextValue());

    return [
      'text' => $item->getTextValue(),
      'postal_code' => $postal_code,
      'city' => $city,
      'address' => $address,
      // It's a DAWA field, so we can assume it's a Danish address.
      'country' => 'DK',
    ];

  }

}
