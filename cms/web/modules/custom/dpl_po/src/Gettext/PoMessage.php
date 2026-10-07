<?php

declare(strict_types=1);

namespace Drupal\dpl_po\Gettext;

/**
 * One message of a .po file, as read from or written to the combined file.
 *
 * A message is identified by its context and source. The header is the
 * message with an empty source and no context; its translation holds the
 * header fields.
 */
final class PoMessage {

  /**
   * Class constructor.
   *
   * @param string $context
   *   The msgctxt, or an empty string when the message has none.
   * @param string $source
   *   The msgid.
   * @param string|null $plural
   *   The msgid_plural, or NULL for a singular message.
   * @param string[] $translations
   *   The msgstr, as one entry for a singular message and one entry per form
   *   for a plural one. An untranslated message holds empty strings.
   * @param string[] $flags
   *   The "#," flags, such as "fuzzy".
   * @param string[] $comments
   *   The translator comment lines, including their leading "#".
   */
  public function __construct(
    public readonly string $context,
    public readonly string $source,
    public readonly ?string $plural,
    public readonly array $translations,
    public readonly array $flags = [],
    public readonly array $comments = [],
  ) {}

  /**
   * What identifies the message within a file.
   */
  public function key(): string {
    return $this->context . "\x04" . $this->source;
  }

  /**
   * Whether this is the header pseudo-message.
   */
  public function isHeader(): bool {
    return $this->context === '' && $this->source === '';
  }

  /**
   * Whether at least one form has a translation.
   */
  public function isTranslated(): bool {
    foreach ($this->translations as $translation) {
      if ($translation !== '') {
        return TRUE;
      }
    }
    return FALSE;
  }

  /**
   * The same message with Unix line breaks in every string.
   */
  public function withUnixLineBreaks(): self {
    $convert = fn (string $string): string => str_replace("\r\n", "\n", $string);
    return new self(
      $convert($this->context),
      $convert($this->source),
      $this->plural === NULL ? NULL : $convert($this->plural),
      array_map($convert, $this->translations),
      $this->flags,
      $this->comments,
    );
  }

  /**
   * The same message with other translations and flags.
   *
   * @param string[] $translations
   *   The translations to carry instead.
   * @param string[] $flags
   *   The flags to carry instead.
   */
  public function withTranslations(array $translations, array $flags): self {
    return new self($this->context, $this->source, $this->plural, $translations, $flags, $this->comments);
  }

}
