# Translation System

## Components

To make the "translation traffic" work following components are being used:

* Git. By having the *.po fiules in git it enables us to React to changes and
contact relevant services when changes occur
* POEditor Webhook. Which is used to tell POEditor
when it should look for new translations
* SendToPoeditor Github Action step. Scans and commits translations.
And notifies POEditor that new translations are present.
* PublishToGithubPages Github Action step. Publishes the new *.po file to
Github Pages which is used as a translation server for the library sites.

## Subscribing to translations

Because the translation server is defined in the dpl_cms profile
(dpl_cms.info.yml) it is possible to track changes and update the translations
on the individual library sites.

## New translation

```mermaid
sequenceDiagram
  Developer -> GitHubActions: Merge PR into develop
  GitHubActions -> GitHubActions: Scan codebase and write strings to .po file
  GitHubActions -> GitHubActions: Fill .po file with already imported translations
  GitHubActions -> GitHub: Commit updated *.po file
  GitHub -> Poeditor: Webhook tells POEditor to import new strings from GitHub
  Poeditor -> GitHub: Import updated *.po file
```

## Add or update translation

```mermaid
sequenceDiagram
  Translator -> Poeditor: Translates strings
  Translator -> Poeditor: Pushes button to export strings to GitHub
  Poeditor -> GitHub: Commits translations to GitHub (develop)
  DplCms -> GitHub: By manually requesting or by a cron job translations are imported to DPL CMS.
```
