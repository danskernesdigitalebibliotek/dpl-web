<?php

declare(strict_types=1);

namespace Drupal\bnf\Exception;

/**
 * Custom exception, used when node already exists upstream.
 */
class AlreadyExistsException extends \RuntimeException {}
