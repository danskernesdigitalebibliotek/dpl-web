<?php

namespace Drupal\dpl_campaign;

/**
 * Weight-options for Campaign nodes.
 *
 * If multiple campaigns matches a query, the one with the highest weight
 * will be used.
 */
enum CampaignWeight: int {
  // Increments by 10, to allow us to easily add more options in the future.
  case Highest = 100;
  case High = 90;
  case Medium = 80;
  case Low = 70;

  // National (BNF) content must not take precedence over local content.
  // If adding more, remember to update $this->getBnfEnums().
  case BnfHighest = 60;
  case BnfHigh = 50;
  case BnfMedium = 40;
  case BnfLow = 30;

  /**
   * The BNF-specific values. We use this function to easily filter them out.
   *
   * @return CampaignWeight[]
   *   The BNF-specific weights.
   */
  public static function getBnfEnums(): array {
    return [
      CampaignWeight::BnfHighest,
      CampaignWeight::BnfHigh,
      CampaignWeight::BnfMedium,
      CampaignWeight::BnfLow,
    ];
  }

  /**
   * Provide a human-readable representation of the enum.
   *
   * @return string
   *   Human-readable representation.
   */
  public function label(): string {
    $translation = \Drupal::translation();

    return match($this) {
      CampaignWeight::Highest => $translation->translate('Highest', [], ['context' => 'dpl_campaign']),
      CampaignWeight::High => $translation->translate('High', [], ['context' => 'dpl_campaign']),
      CampaignWeight::Medium => $translation->translate('Medium', [], ['context' => 'dpl_campaign']),
      CampaignWeight::Low => $translation->translate('Low', [], ['context' => 'dpl_campaign']),
      CampaignWeight::BnfHighest => $translation->translate('Highest (National)', [], ['context' => 'dpl_campaign']),
      CampaignWeight::BnfHigh => $translation->translate('High (National)', [], ['context' => 'dpl_campaign']),
      CampaignWeight::BnfMedium => $translation->translate('Medium (National)', [], ['context' => 'dpl_campaign']),
      CampaignWeight::BnfLow => $translation->translate('Low (National)', [], ['context' => 'dpl_campaign']),
    };
  }

}
