# Local development

## Copy database from Lagoon environment to local setup

### Retrieve database from Lagoon
TODO: Description of db retrieval.

### Restore database locally
In order to load the the sql dump file into the local Drupal cms you need to place one, and only one file into the database-dump directory.
When the file is present in the directory you can run: `task dev:db:restore` and the file will be loaded into the database.