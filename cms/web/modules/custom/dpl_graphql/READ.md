# INTRODUCTION

This module handles our custom Schema extensions for GraphQL and GraphQLCompose.

We wanted to keep all configuration available through the same GraphQL query.
The way we do this, is by adding a new DplConfiguration Type and SchemeExtension
which acts as the the gateway for all configuration.
The DplConfiguration Type can then be extended in other modules.

It will also be possible to add new SchemaTypes and SchemaExtension plugins for
handling other areas of the application.

## How to extend

* Add a new GraphQLCompose/SchemaType plugin to your module.
* Add a new GraphQL/SchemaExtension plugin to your module.
* Your SchemaType plugin should define include 2 functions:
  * getTypes() - Should return an array defining your new Type and it's fields.
  * getExtensions() - Should add your new Type to an already existing Schema.
* Your SchemaExtension plugin should include resolvers for your new Type.
  * Make sure to add resolvers that pass the relevant data to your new Type.
