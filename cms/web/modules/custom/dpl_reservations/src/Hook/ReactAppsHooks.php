<?php

declare(strict_types=1);

namespace Drupal\dpl_reservations\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\Url;

/**
 * React apps hooks for dpl_reservations module.
 */
class ReactAppsHooks {

  use StringTranslationTrait;

  public function __construct(TranslationInterface $stringTranslation) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Expose the reservations page URL and texts to the React apps.
   *
   * @param array<mixed> $data
   *   Data for the React apps by reference.
   */
  #[Hook('dpl_react_apps_data')]
  public function addReservationsData(array &$data): void {
    $data['urls'] += [
      'reservations' => dpl_react_apps_ensure_url_is_string(
        Url::fromRoute('dpl_reservations.list', [], ['absolute' => TRUE])->toString()
      ),
    ];
    $data['texts'] += [
      'reservation-list-loan-before' => $this->t('Borrow before @date', [], ['context' => 'Reservation list']),
    ];
  }

}
