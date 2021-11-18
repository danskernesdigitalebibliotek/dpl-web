# Local development

## Copy database from Lagoon environment to local setup
Prerequisites:
* Login credentials to the Lagoon UI, or an existing database dump

The following describes how to first fetch a database-dump and then import the
dump into a running local environment. Be aware that this only gives you the
database, not any files from the site.

1. To retrieve a database-dump from a running site, consult the "[How do I download a database dump?](https://docs.lagoon.sh/lagoon/resources/tutorials-and-webinars#how-do-i-download-a-database-dump)" guide in the official Lagoon. Skip this step if you already have a database-dump.
2. Place the dump in the [database-dump](../database-dump) directory, be aware
   that the directory is only allowed to contain a single `.sql` file.
3. Start a local environment using `task dev:reset`
4. Import the database by running `task dev:db:restore`
