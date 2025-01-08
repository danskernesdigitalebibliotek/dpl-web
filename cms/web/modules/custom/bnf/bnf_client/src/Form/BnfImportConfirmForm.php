<?php

namespace Drupal\bnf_client\Form;

use Drupal\bnf\Exception\AlreadyExistsException;
use Drupal\bnf\Services\BnfImporter;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\AutowireTrait;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Form\FormInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
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
   * {@inheritDoc}
   */
  public function __construct(
    protected RouteMatchInterface $routeMatch,
    protected MessengerInterface $messenger,
    protected BnfImporter $bnfImporter,
    #[Autowire(service: 'logger.channel.bnf')]
    protected LoggerInterface $logger,
    ConfigFactoryInterface $configFactory,
  ) {
    $this->baseUrl = $configFactory->get(SettingsForm::CONFIG_NAME)->get('base_url');
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
    $form['#title'] = $this->t('Confirm import of BNF content', [], ['context' => 'BNF']);

    $uuid = $this->routeMatch->getParameter('uuid');
    $bnfServer = $this->baseUrl . 'graphql';

    $form_state->set('uuid', $uuid);
    $form_state->set('bnfServer', $bnfServer);

    $importable = TRUE;

    try {
      $nodeData = $this->bnfImporter->loadNodeData($uuid, $bnfServer);
    }
    catch (\Exception $e) {
      $importable = FALSE;

      $this->messenger->addError($this->t('Cannot import this node from BNF.', [], ['context' => 'BNF']));

      if ($e instanceof AlreadyExistsException) {
        $this->messenger->addError($this->t('Node has previously been imported from BNF.', [], ['context' => 'BNF']));
      }
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
      '#default_value' => $nodeData['title'] ?? NULL,
      '#disabled' => TRUE,
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
    $bnfServer = $form_state->get('bnfServer');

    try {
      $node = $this->bnfImporter->importNode($uuid, $bnfServer);
      $form_state->setRedirect('entity.node.edit_form', ['node' => $node->id()]);
    }
    catch (\Exception $e) {
      $this->logger->error('Could not import node from BNF. @message', ['@message' => $e->getMessage()]);

      $this->messenger->addError($this->t('Could not import node from BNF.', [], ['context' => 'BNF']));

      if ($e instanceof AlreadyExistsException) {
        $this->messenger->addError($this->t('Node has previously been imported from BNF.', [], ['context' => 'BNF']));
      }
    }

  }

}
