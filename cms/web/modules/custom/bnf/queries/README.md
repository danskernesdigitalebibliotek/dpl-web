# GraphQL queries

This directory contains the queries BNF uses when synchronizing
content. These queries is processed by
[Sailor](https://github.com/spawnia/sailor) to generate the client
classes in ../src/GraphQL/.

In order to sync a new field or other data, modify these to include
the new data, and run `task dev:bnf:generate-graphql` to
update the client classes. This will likely make some of the tests
fail as they don't take the new data into consideration. Add in test
data as appropriate and add assertions to test that the new data in
mapped properly. Only then modify the mapper classes to handle the new
data, the tests will tell you when you're done.
