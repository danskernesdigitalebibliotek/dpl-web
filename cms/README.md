# The library CMS, powered by Drupal (formerly 'dpl-cms')

This is the main repository used for building the core Drupal CMS which is used
by the Danish Public Libraries.

You can find the full documentation, along with setup instructions in either the
[documentation site](https://danskernesdigitalebibliotek.github.io/dpl-docs/DPL-CMS/),
or directly in [the docs folder](docs/)

**tl;dr:** Run `task dev:reset`, or use `task dev:reset:clean` for a full local
reinstall.

Run `task dev:watch` to clear drupal cache when changing files.

For a environment that consists of both a CMS site and a BNF site, run
`task dev:bnf:enable` before running `task dev:reset:clean`.


DEPLOY