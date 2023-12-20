<?php

use TwigCsFixer\Config\Config;
use TwigCsFixer\File\Finder;

return (new Config())
  ->setFinder((new Finder())
    ->path('web/themes/custom/')
    ->path('web/modules/custom/')
  );
