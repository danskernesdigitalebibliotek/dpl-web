<?php

declare(strict_types = 1);

namespace Drupal\dpl_event\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\array_combine as array_combine;

/**
 * Configure Event settings for this site.
 */
final class SettingsForm extends ConfigFormBase {

  const CONFIG_NAME = 'dpl_event.settings';

  /**
   * Constructor for the settings form.
   */
  public function __construct(
      ConfigFactoryInterface $config_factory,
      private DateFormatterInterface $dateFormatter
  ) {
    parent::__construct($config_factory);
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
          $container->get('config.factory'),
          $container->get('date.formatter')
      );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return self::CONFIG_NAME;
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [self::CONFIG_NAME];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config(self::CONFIG_NAME);

    $form['unpublish'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Automatic unpublication', [], ['context' => 'DPL event']),
    ];

    $period = [
    // 6 hours
      21600,
    // 12 hours
      43200,
    // 1 day
      86400,
    // 3 days
      259200,
    // 1 week
      604800,
    // 2 weeks
      1209600,
    // 1 month
      2592000,
    // 3 months
      7776000,
    // 6 months
      15552000,
    ];
    $period = array_map([$this->dateFormatter, 'formatInterval'], array_combine($period, $period));
    $form['unpublish']['unpublish_schedule'] = [
      '#type' => 'select',
      '#title' => $this->t('Schedule', [], ['context' => "DPL event"]),
      '#default_value' => $config->get('unpublish_schedule'),
      '#options' => $period,
      '#empty_option' => $this->t('Automatic unpublication disabled', [], ['context' => "DPL event"]),
      '#empty_value' => 0,
      '#description' => $this->t('How much time should pass after an event has occurred before it should be unpublished automatically.', [], ['context' => "DPL event"]),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config(self::CONFIG_NAME)
      ->set('unpublish_schedule', $form_state->getValue('unpublish_schedule'))
      ->save();
    parent::submitForm($form, $form_state);
  }

}
