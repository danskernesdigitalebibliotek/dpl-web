<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Hook;

use Drupal\Core\Hook\Attribute\Hook;

/**
 * Gin admin theme hooks for dpl_event module.
 */
class GinHooks {

  /**
   * Have Gin manage the event forms as content forms.
   *
   * @return string[]
   *   Event-related routes which should be managed as content forms.
   */
  #[Hook('gin_content_form_routes')]
  public function addEventContentFormRoutes(): array {
    return [
      'entity.eventseries.add_form',
      'entity.eventseries.edit_form',
      // There is no direct add form for instances. They are always created in
      // relation to series.
      'entity.eventseries.add_instance_form',
      'entity.eventinstance.edit_form',
    ];
  }

}
