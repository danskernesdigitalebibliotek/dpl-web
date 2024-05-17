<?php declare(strict_types = 1);

namespace Drupal\collation_fixer\Form;

use Drupal\collation_fixer\CollationFixer;
use Drupal\Core\Database\DatabaseException;
use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class CollationFixerForm extends ConfirmFormBase {

  public function __construct(
    private CollationFixer $collationFixer,
    private string $table = ''
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('collation_fixer.collation_fixer')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'collation_fixer_collation_fixer';
  }

  /**
   * {@inheritdoc}
   */
  public function getQuestion(): TranslatableMarkup {
    return $this->t('Fix collation of table: @table', ['@table' => $this->table]);
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl(): Url {
    return new Url('system.status');
  }

  public function buildForm(array $form, FormStateInterface $form_state, string $table = '') {
    if (!$this->collationFixer->checkCollation($table)) {
      throw new NotFoundHttpException();
    }
    $this->table = $table;
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    try {
      $this->collationFixer->fixCollation($this->table);
      $this->messenger()->addStatus($this->t('Fixed collation of table: %table', [ '%table' => $this->table ]));
    } catch (DatabaseException $e) {
      $this->messenger()->addError($this->t(
        'Unable to fix collation for table %table: %message',
        ['%table' => $this->table, '%message' => $e->getMessage()]
      ));
    }
    $form_state->setRedirectUrl(new Url('system.status'));
  }

}
