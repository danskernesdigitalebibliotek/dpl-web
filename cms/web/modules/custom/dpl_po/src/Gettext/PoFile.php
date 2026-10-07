<?php

declare(strict_types=1);

namespace Drupal\dpl_po\Gettext;

use function Safe\preg_match;

/**
 * Reads and writes .po files in the layout POEditor exports.
 *
 * The combined file is written by us and by POEditor in turn. Every tool lays
 * a .po file out differently, and each difference becomes a few thousand
 * changed lines whenever the other side writes the file. So what we write
 * follows POEditor byte for byte: no line wrapping, the first line of a
 * multi-line string on the keyword line, an empty "#:" reference before every
 * message, and the header fields each on their own line.
 *
 * Drupal's own PoStreamReader and PoStreamWriter are not used: the reader
 * drops the flags, which POEditor exports, and the writer wraps lines.
 */
final class PoFile {

  /**
   * Parse the contents of a .po file.
   *
   * Only what the combined file holds is understood: comments, flags, context,
   * source, plural and translations. Obsolete ("#~") messages are left out.
   *
   * @param string $contents
   *   The file contents.
   *
   * @return \Drupal\dpl_po\Gettext\PoMessage[]
   *   The messages in the order of the file, the header first if there is one.
   */
  public static function parse(string $contents): array {
    $messages = [];
    $entry = self::emptyEntry();
    $field = NULL;
    $index = 0;

    foreach (explode("\n", $contents) as $number => $line) {
      $line = rtrim($line, "\r");

      if ($line === '') {
        self::flush($messages, $entry);
        $entry = self::emptyEntry();
        $field = NULL;
        continue;
      }

      if ($line[0] === '#') {
        // Comments belong to the message that follows them. Finding one after
        // strings means a new message began without a blank line in between.
        if ($entry['source'] !== NULL) {
          self::flush($messages, $entry);
          $entry = self::emptyEntry();
          $field = NULL;
        }
        $kind = $line[1] ?? '';
        if ($kind === ',') {
          $entry['flags'] = array_values(array_filter(array_map('trim', explode(',', substr($line, 2)))));
        }
        elseif ($kind === '~') {
          $entry['obsolete'] = TRUE;
        }
        elseif (!in_array($kind, [':', '.', '|'], TRUE)) {
          $entry['comments'][] = $line;
        }
        continue;
      }

      if (preg_match('/^(msgctxt|msgid_plural|msgid|msgstr(?:\[(\d+)\])?) (".*")$/', $line, $match)) {
        $keyword = $match[1];
        if (in_array($keyword, ['msgctxt', 'msgid'], TRUE) && ($entry['translations'] !== [] || $entry['obsolete'])) {
          self::flush($messages, $entry);
          $entry = self::emptyEntry();
        }
        $field = match ($keyword) {
          'msgctxt' => 'context',
          'msgid' => 'source',
          'msgid_plural' => 'plural',
          default => 'translation',
        };
        $index = (int) $match[2];
        self::append($entry, $field, $index, self::unquote($match[3]));
        continue;
      }

      if ($field !== NULL && preg_match('/^".*"$/', $line)) {
        self::append($entry, $field, $index, self::unquote($line));
        continue;
      }

      throw new \RuntimeException(sprintf('Cannot read line %d of the .po file: %s', $number + 1, $line));
    }
    self::flush($messages, $entry);

    return $messages;
  }

  /**
   * Render messages as the contents of a .po file.
   *
   * @param \Drupal\dpl_po\Gettext\PoMessage[] $messages
   *   The messages, in the order they are to be written.
   *
   * @return string
   *   The file contents.
   */
  public static function render(array $messages): string {
    $output = '';
    foreach ($messages as $message) {
      $output .= $message->isHeader() ? self::renderHeader($message) : self::renderMessage($message);
      $output .= "\n";
    }
    return $output;
  }

  /**
   * Render the header message.
   *
   * The header is the one string that is written one field per line, with
   * nothing on the msgstr line. The comments and flags above it are kept, so
   * that a file we only reorder keeps its header as it was.
   */
  protected static function renderHeader(PoMessage $header): string {
    $output = self::renderComments($header);
    $output .= "msgid \"\"\nmsgstr \"\"\n";
    $fields = explode("\n", $header->translations[0] ?? '');
    $last = array_pop($fields);
    foreach ($fields as $field) {
      $output .= '"' . self::escape($field) . '\n"' . "\n";
    }
    if ($last !== '') {
      $output .= '"' . self::escape($last) . '"' . "\n";
    }
    return $output;
  }

  /**
   * Render an ordinary message.
   */
  protected static function renderMessage(PoMessage $message): string {
    // POEditor writes an empty source reference above every message. Matching
    // it is what keeps the file identical to the one POEditor exports.
    $output = "#: \n";
    $output .= self::renderComments($message);
    if ($message->context !== '') {
      $output .= self::renderString('msgctxt', $message->context);
    }
    $output .= self::renderString('msgid', $message->source);
    if ($message->plural === NULL) {
      $output .= self::renderString('msgstr', $message->translations[0] ?? '');
    }
    else {
      $output .= self::renderString('msgid_plural', $message->plural);
      foreach ($message->translations as $index => $translation) {
        $output .= self::renderString("msgstr[$index]", $translation);
      }
    }
    return $output;
  }

  /**
   * Render the translator comments and flags of a message.
   */
  protected static function renderComments(PoMessage $message): string {
    $output = '';
    foreach ($message->comments as $comment) {
      $output .= $comment . "\n";
    }
    if ($message->flags !== []) {
      $output .= '#, ' . implode(', ', $message->flags) . "\n";
    }
    return $output;
  }

  /**
   * Render a keyword and its string.
   *
   * A string is split at its line breaks, each part on a line of its own with
   * the first part on the keyword line. A string that ends in a line break
   * gets an empty final part, as POEditor writes it.
   */
  protected static function renderString(string $keyword, string $string): string {
    $parts = explode("\n", $string);
    $last = array_pop($parts);
    $lines = array_map(fn (string $part): string => '"' . self::escape($part) . '\n"', $parts);
    $lines[] = '"' . self::escape($last) . '"';
    return $keyword . ' ' . implode("\n", $lines) . "\n";
  }

  /**
   * Escape a string for a .po file.
   *
   * Only what POEditor escapes is escaped. Gettext would also escape other
   * control characters, but POEditor writes those back as they are, and a
   * couple of strings hold one.
   */
  protected static function escape(string $string): string {
    return addcslashes($string, "\"\\\n\t\r");
  }

  /**
   * Read a quoted .po string.
   */
  protected static function unquote(string $quoted): string {
    return stripcslashes(substr($quoted, 1, -1));
  }

  /**
   * An entry with nothing read into it yet.
   *
   * @return array{comments: string[], flags: string[], obsolete: bool, context: string, source: string|null, plural: string|null, translations: array<int, string>}
   *   The entry.
   */
  protected static function emptyEntry(): array {
    return [
      'comments' => [],
      'flags' => [],
      'obsolete' => FALSE,
      'context' => '',
      'source' => NULL,
      'plural' => NULL,
      'translations' => [],
    ];
  }

  /**
   * Add a string to a field of the entry being parsed.
   *
   * A string starts on its keyword line and may go on over the lines below.
   *
   * @param array{comments: string[], flags: string[], obsolete: bool, context: string, source: string|null, plural: string|null, translations: array<int, string>} $entry
   *   The entry.
   * @param string $field
   *   One of "context", "source", "plural" and "translation".
   * @param int $index
   *   The form, for a translation.
   * @param string $text
   *   What to add.
   */
  protected static function append(array &$entry, string $field, int $index, string $text): void {
    if ($field === 'translation') {
      $entry['translations'][$index] = ($entry['translations'][$index] ?? '') . $text;
    }
    elseif ($field === 'context') {
      $entry['context'] .= $text;
    }
    elseif ($field === 'plural') {
      $entry['plural'] = ($entry['plural'] ?? '') . $text;
    }
    else {
      $entry['source'] = ($entry['source'] ?? '') . $text;
    }
  }

  /**
   * Turn a parsed entry into a message, if it holds one.
   *
   * @param \Drupal\dpl_po\Gettext\PoMessage[] $messages
   *   The messages read so far.
   * @param array{comments: string[], flags: string[], obsolete: bool, context: string, source: string|null, plural: string|null, translations: array<int, string>} $entry
   *   The entry.
   */
  protected static function flush(array &$messages, array $entry): void {
    if ($entry['source'] === NULL || $entry['obsolete']) {
      return;
    }
    $translations = $entry['translations'];
    ksort($translations);
    if ($translations === []) {
      $translations = [''];
    }
    $messages[] = new PoMessage(
      $entry['context'],
      $entry['source'],
      $entry['plural'],
      array_values($translations),
      $entry['flags'],
      $entry['comments'],
    );
  }

}
