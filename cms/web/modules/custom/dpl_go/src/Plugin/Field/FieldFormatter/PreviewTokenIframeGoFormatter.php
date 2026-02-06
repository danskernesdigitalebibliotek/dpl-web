<?php

namespace Drupal\dpl_go\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Render\BubbleableMetadata;
use Drupal\Core\Template\Attribute;
use Drupal\Core\Utility\Token;
use Drupal\dpl_go\GoSite;
use Drupal\graphql_compose_preview\TokenHelper;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Plugin implementation of the 'preview_token_whatever' formatter.
 *
 * @FieldFormatter(
 *   id = "go_preview_token_iframe",
 *   label = @Translation("GO token preview iframe"),
 *   field_types = {
 *     "preview_token",
 *   },
 * )
 */
class PreviewTokenIframeGoFormatter extends FormatterBase {

  /**
   * The GoSite service.
   *
   * @var \Drupal\dpl_go\GoSite
   */
  protected GoSite $goSite;

  /**
   * The token service.
   *
   * @var \Drupal\Core\Utility\Token
   */
  protected Token $token;

  /**
   * The token helper service.
   *
   * @var \Drupal\graphql_compose_preview\TokenHelper
   */
  protected TokenHelper $tokenHelper;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    $instance = parent::create($container, $configuration, $plugin_id, $plugin_definition);

    $instance->token = $container->get('token');
    $instance->tokenHelper = $container->get('graphql_compose_preview.token_helper');
    $instance->goSite = $container->get('dpl_go.go_site');

    return $instance;
  }

  /**
   * Get the iframe URL.
   *
   * @return string
   *   The iframe URL.
   */
  protected function getLinkUrl(): string {
    return $this->goSite->getGoBaseUrl() . '/preview/[node:preview:uuid]?token=[node:preview:token]';
  }

  /**
   * {@inheritDoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode): array {
    $element = [];

    $entity = $items->getEntity();
    if (!$entity instanceof NodeInterface) {
      return [];
    }

    $url = $this->tokenHelper->url($entity);
    if (!$url) {
      return [];
    }

    $access = $this->tokenHelper->access($entity);
    $cache_metadata = new BubbleableMetadata();

    $src = $this->token->replace(
      $this->getLinkUrl(),
      ['node' => $entity],
      ['clear' => FALSE]
    );

    foreach ($items as $delta => $item) {
      $element[$delta] = [
        '#theme' => 'token_preview_iframe',
        '#node' => $entity,
        '#preview_token' => $item,
        '#preview_token_url' => $url,
        '#preview_token_access' => $access,
        '#attributes' => new Attribute([
          'src' => $src,
          'class' => 'go-preview-iframe',
          'width' => '100%',
          'height' => '100%',
          'style' => 'height: calc((100vh - 0px) - 121px);',
          'allow' => 'fullscreen autoplay',
          'allowtransparency' => $this->getSetting('transparency'),
          'frameborder' => 0,
        ]),
      ];
    }

    $cache_metadata->addCacheableDependency($url);
    $cache_metadata->applyTo($element);

    return $element;
  }

}
