<?php

use TwigCsFixer\Config\Config;
use TwigCsFixer\File\Finder;
use TwigCsFixer\Rules\Literal\HashQuoteRule;
use TwigCsFixer\Ruleset\Ruleset;
use TwigCsFixer\Standard\TwigCsFixer;

// potx only extracts a translation context from a quoted key, as in
// {% trans 'Text' with {'context': 'Header'} %}. HashQuoteRule would strip
// the quotes, and the string would reach the PO file without its context.
$ruleset = new Ruleset();
$ruleset->addStandard(new TwigCsFixer());
$ruleset->removeRule(HashQuoteRule::class);

return (new Config())
  ->setRuleset($ruleset)
  ->setFinder((new Finder())
    ->path('web/themes/custom/')
    ->path('web/modules/custom/')
  );
