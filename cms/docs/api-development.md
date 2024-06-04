# API Development

We use the [RESTful Web Services and OpenAPI REST Drupal modules](./architecture/adr-006-api-specification.md)
to expose endpoints from Drupal as an API to be consumed by external parties.

## Howtos

### Create a new endpoint

1. Implement a new REST resource plugin by extending
   `Drupal\rest\Plugin\ResourceBase` and annotating it with `@RestResource`
2. Describe `uri_paths`, `route_parameters` and `responses` in the annotation as
   detailed as possible to create a strong specification.
3. Install the REST UI module `drush pm-enable restui`
4. Enable and configure the new REST resource. It is important to use the
   `dpl_login_user_token` authentication provider for all resources which will
   be used by the frontend this will provide a library or user token by default.
5. Inspect the updated OpenAPI specification at `/openapi/rest?_format=json` to
   ensure looks as intended
6. Run `task ci:openapi:validate` to validate the updated OpenAPI specification
7. Run `task ci:openapi:download` to download the updated OpenAPI specification
8. Uninstall the REST UI module `drush pm-uninstall restui`
9. Export the updated configuration `drush config-export`
10. Commit your changes including the updated configuration and `openapi.json`
