# Architecture Decision Record: User Handling

## Context

There are different types of users that are interacticting with the CMS system:

* Patrons that is authenticated by logging into Adgangsplatformen.
* Editors and administrators (and similar roles) that are are handling content
  and configuration of the site.

We need to be able to handle that both type of users can be authenticated and
authorized in the scope of permissions that are tied to the user type.

We had some discussions wether the Adgangsplatform users should be tied to a
Drupal user or not. As we saw it we had two options when a user logs in:

1. Keep session/access token client side in the browser and not creating a
   Drupal user.
2. Create a Drupal user and map the user with the external user.

## Decision

We ended up with desicion no. 2 mentioned above. So we create a Drupal user upon
login if it is not existing already.

We use the [OpeOpenID Connect / OAuth client module](https://www.drupal.org/project/openid_connect)
to manage patron authentication and authorization. And we have developed a
plugin for the module called: Adgangsplatformen which connects the external
oauth service with dpl-cms.

Editors and administrators a.k.a normal Drupal users and does not require
additional handling.

## Consequences

* By having a Drupal user tied to the external user we can use that context and
  make the server side rendering show different content according to the
  authenticated user.
* Adgangsplatform settings have to be configured in the plugin in order to work.

## Future considerations

Instead of creating a new user for every single user logging in via
Adgangsplatformen you could consider having just one Drupal user for all the
external users. That would get rid of the UUID -> Drupal user id mapping that
has been implemented as it is now. And it would prevent creation of a lot
of users. The decision depends on if it is necessary to distinguish between the
different users on a server side level.
