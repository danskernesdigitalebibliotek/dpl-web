<?php

namespace Drupal\bnf_client\Form;

use Drupal\bnf\Services\BnfImporter;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\AutowireTrait;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\node\NodeInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Displaying an import preview, and allowing editor to import.
 */
class BnfImportConfirmForm implements FormInterface, ContainerInjectionInterface {

  use AutowireTrait;
  use StringTranslationTrait;

  /**
   * The BNF site base URL.
   */
  protected string $baseUrl;

  /**
   * The node storage.
   */
  protected EntityStorageInterface $nodeStorage;

  /**
   * {@inheritDoc}
   */
  public function __construct(
    protected RouteMatchInterface $routeMatch,
    protected MessengerInterface $messenger,
    protected BnfImporter $bnfImporter,
    #[Autowire(service: 'logger.channel.bnf')]
    protected LoggerInterface $logger,
    ConfigFactoryInterface $configFactory,
    EntityTypeManagerInterface $entityTypeManager,
    TranslationInterface $stringTranslation,
  ) {
    $this->baseUrl = $configFactory->get(SettingsForm::CONFIG_NAME)->get('base_url');
    $this->nodeStorage = $entityTypeManager->getStorage('node');
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * {@inheritDoc}
   */
  public function getFormId(): string {
    return 'bnf_import_form_form';
  }

  /**
   * {@inheritDoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $uuid = $this->routeMatch->getParameter('uuid');
    $existingNodes = $this->nodeStorage->loadByProperties(['uuid' => $uuid]);

    if (!empty($existingNodes)) {
      $this->messenger->addError($this->t('Node has previously been imported from BNF.', [], ['context' => 'BNF']));

      return [];
    }

    $form['#title'] = $this->t('Confirm import of BNF content', [], ['context' => 'BNF']);

    $uuid = $this->routeMatch->getParameter('uuid');
    $bnfServer = $this->baseUrl . 'graphql';

    $form_state->set('uuid', $uuid);
    $form_state->set('bnfServer', $bnfServer);

    $importable = TRUE;

    try {
      $title = $this->bnfImporter->getNodeTitle($uuid, $bnfServer);
    }
    catch (\Exception $e) {
      $importable = FALSE;

      $this->logger->error(
        'Could not get node title for @uuid from BNF. @message',
        ['@message' => $e->getMessage(), '@uuid' => $uuid]
      );
      $this->messenger->addError($this->t('Cannot import this node from BNF.', [], ['context' => 'BNF']));
    }

    $form['uuid'] = [
      '#title' => 'UUID',
      '#type' => 'textfield',
      '#default_value' => $uuid,
      '#disabled' => TRUE,
    ];

    $form['label'] = [
      '#title' => $this->t('Content label', [], ['context' => 'BNF']),
      '#type' => 'textfield',
      '#default_value' => $title ?? NULL,
      '#disabled' => TRUE,
    ];

    $form['bnf_keep_updated'] = [
      '#title' => $this->t('Keep updated with Delingstjenesten', [], ['context' => 'BNF']),
      '#type' => 'checkbox',
      '#description' => $this->t('Keep this content, which originates from Delingstjenesten, up to date when a new version is available. This will overwrite any custom changes you may have made. <strong>You can always change your mind directly on the content.</strong>', [], ['context' => 'BNF']),
      '#default_value' => TRUE,
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import content'),
      '#disabled' => !$importable,
    ];

    return $form;
  }

  /**
   * {@inheritDoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {

  }

  /**
   * {@inheritDoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $uuid = $form_state->get('uuid');
    $keepUpdated = !empty($form_state->getValue('bnf_keep_updated'));
    $bnfServer = $form_state->get('bnfServer');

    try {
      $node = $this->bnfImporter->importNode($uuid, $bnfServer, $keepUpdated);

      if (!($node instanceof NodeInterface)) {
        throw new \Exception('Importer did not return a node instance.');
      }

      $node->setUnpublished();
      $node->save();

      $form_state->setRedirect('entity.node.edit_form', ['node' => $node->id()]);
    }
    catch (\Exception $e) {
      $this->messenger->addError($this->t('Could not import node from BNF.', [], ['context' => 'BNF']));

      $this->logger->error('Could not import node from BNF. @message', ['@message' => $e->getMessage()]);
    }

  }

}
