# Translation

We manage translations as a part of the codebase using `.po` translation files.
Consequently translations must be part of either official or local translations
to take effect on the individual site.

DPL CMS is configured to use English as the master language but is configured
to use Danish for all users through language negotiation. This allows us to
follow a process where English is the default for the codebase but actual usage
of the system is in Danish.

This is based on [an approach described by the LimoenGroen Drupal agency](https://medium.com/limoengroen/how-to-deploy-drupal-interface-translations-5653294c4af6).


## Howtos

### Add new translation

1. Add the translation to the `web/profiles/dpl_cms/translations/da.po` file

```po
msgid "Make content sticky"
msgstr "Lav indhold klæbrigt"
```

2. Commit the changes

### Update existing translation

1. Locate the translation in the `web/profiles/dpl_cms/translations/da.po` file

```po
msgid "Make content sticky"
msgstr "Lav indhold klistret"
```

2. Commit the changes

### Import updated translations

1. Run `drush locale-check`
2. Run `drush locale-update`
