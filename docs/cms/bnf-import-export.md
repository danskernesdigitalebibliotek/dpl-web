# BNF: Content import/export

The sharing of content in the BNF system uses GraphQL for the
communication between sites.

## Extending the content shared

To add data (new fields, paragraphs or node types) is a four step process:

1. Ensure that the GraphQL compose module exposes the data.
2. Adding the data to the queried data.
3. Running the code generator Sailor.
4. Adding/modifying the mappers to add the data to created nodes.

### Adding data to GraphQL

The BNF modules is using the GraphQL compose module to expose the
content data. It can be administered through Drupal at at
`/admin/config/graphql_compose`.

Note that GraphQL compose doesn't handle non-exposed subtypes very
well, so all paragraph types must be enabled to avoid fatal errors on
queries that fetch a node that include the paragraph. if a paragraph
type doesn't need to be synchronized, enable the paragraph, but not any of
it's fields.

### Modifying the query

The GraphQL query used for synchronizing nodes is defined in
`web/modules/custom/bnf/queries/node.graphql` file. This query selects
all needed data on a node and is used to generate a PHP client used by
the 'bnf' module.

### Running Sailor

The Sailor GraphQL client generator maintains its own copy of the
GraphQL schema, so if the schema changes (and occasionally, for good
measure), it needs to fetch a fresh copy:

```shell
task dev:bnfcli -- ./vendor/bin/sailor introspect
```

Then generate the client code from the schema and the query:

```shell
task dev:bnfcli -- ./vendor/bin/sailor
```

Sailor will update the files in the `Drupal\bnf\GraphQL` namespace.

This is a good time to run the tests with

```shell
task dev:cli -- ./vendor/bin/phpunit --filter bnf
```

To ensure that existing tests still pass. Adding fields to existing
entities is likely to make tests fail as the newly generated client
will expect the new fields to be specified in the mocked response data
the tests uses.

### Updating the mappers

Each generated class has a corresponding mapper plugin which maps the
response object into a proper Drupal equivalent, starting with the
node and working inwards recursively.

When working with the mapper classes, it's recommended to start out
with adding tests that verify that the mapper sets the proper
properties on the resultant entities, and use the tests to confirm
that the mapper works as intended. These tests will ensure that any
changes to the GraphQL schema in the future that breaks the
synchronization doesn't go unnoticed.

Don't forget to test the new mapping manually, as the mock objects
only reflect what you think should be done, not what actually works.

What needs to be done to synchronize some data depends on the nature
of the data:

Simple value fields like the title field is handled by the containing
entity, and it's just a matter of making the right mappers `map()`
function take it into account:

```php
  public function map(ObjectLike $object): mixed {
    ...
    $node->set('title', $object->title);
```

More advanced fields might be represented by it's own object in the
response, but doesn't really warrant it's own mapper. Formatted text
fields, for instance. These should be handled in the containing entity
too:

```php
  public function map(ObjectLike $object): mixed {
    ...
    $paragraph->set('field_body', [
      'value' => $object->body->value,
      'format' => $object->body->format,
    ]);
```

More advanced types, and paragraphs in particular, should be handled
by creating a mapper for the type and then recursively map:

```php
  public function map(ObjectLike $object): mixed {
    ...
    if ($object->paragraphs) {
      $paragraphs = [];

      foreach ($object->paragraphs as $paragraph) {
        $paragraphs[] = $this->manager->map($paragraph);
      }

      $node->set('field_paragraphs', $paragraphs);
    }
```

Look at the existing code for guidance.
