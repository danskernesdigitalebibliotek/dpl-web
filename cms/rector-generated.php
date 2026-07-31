<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Php84\Rector\Param\ExplicitNullableParamTypeRector;

/**
 * Rector configuration for post-processing generated API client packages.
 *
 * The OpenAPI generator - even at the latest version - still emits a few
 * implicitly nullable parameters, e.g. `function foo(Type $bar = null)` instead
 * of `function foo(?Type $bar = null)`. These are deprecated as of PHP 8.4. The
 * `php` generator was fixed upstream (7.11+), but `php-symfony` still leaves at
 * least `Service/TypeMismatchException.php` deprecated, and there is no config
 * option or generator version that avoids it. See OpenAPITools/openapi-generator
 * issue #20241.
 *
 * The `dev:codegen:fbs` and `dev:codegen:dpl-cms` tasks run this immediately
 * after (re)generating a client so the checked-in code stays PHP 8.4 clean. We
 * deliberately apply only the single rule that adds the explicit `?` - nothing
 * else in the generated code should be rewritten.
 */
return RectorConfig::configure()
    ->withPaths([
        __DIR__ . '/packages/cms-api',
        __DIR__ . '/packages/fbs-client',
    ])
    ->withRules([ExplicitNullableParamTypeRector::class])
    // These generated support files use PHPDoc that the pinned
    // phpstan/phpdoc-parser version cannot parse, which makes Rector exit with
    // an error. They contain no implicitly nullable parameters (the generator
    // templates already emit explicit `?` there), so skipping them is safe.
    ->withSkip([
        '*/HeaderSelector.php',
        '*/ObjectSerializer.php',
        '*/JmsSerializer.php',
    ]);
