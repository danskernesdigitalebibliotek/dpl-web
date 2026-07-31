# Debugging BNF content synchronization

Issues concerning content synchronization between BNF and individual
libraries can be challenging, so here's a few helpful pointers.

## First off

Ensure that the issue is in fact a synchronization issue. A complaint
that "the subscription doesn't work" can turn out to be completely
unrelated to content synchronization. So ask the reporter exactly what
content they're missing and what they're expecting.

## Cron issues

The subscriptions are run through cron on the client site. So if the
problem is "nothing's happening", it's worth checking that cron runs
and doesn't throw any errors.

## Queue issues

The BNF client module has a `job_schedule` that queues subscription
and node updates which is then processed by the queue system.

Use the `drush queue:*` commands to inspect the state of the queue:

Check current queue items:
  ```bash
  drush queue:list
  ```

If the queue isn't properly processed, cron issues can be the culprit.
Check Grafana for regular "Cron run completed" entries. If another
`hook_cron` throws an exception, it can halt the synchronization
process completely.

Force scheduling of all nodes:
  ```bash
  drush bnf:scheduler:all-nodes
  ```

Schedule check of all subscriptions:
  ```bash
  drush bnf:scheduler:all-subscriptions
  ```


Process node updates queue:
  ```bash
  drush queue:process bnf_client_node_update
  ```

During processing, look out for import failures such as:
`Failed to import content [uuid]: Could not fetch content for [uuid]`

## GraphQL schema mismatches

Synchronization failures can happen if there is a version mismatch
between the central site (DT) and the client sites. For example, if a
new paragraph/media type (e.g. `MediaVideotoolVertical`) has been
introduced on DT (running the latest release) but the client site runs
a previous release: `Failed to import content [uuid]: ... Type
"MediaVideotoolVertical" not found in document.`

Even if the nodes being synchronized do not actually contain the new
type, the client site's GraphQL server will fail because it does not
recognize the type. In this case, the client site must be updated to
the latest release before synchronization will work again.

## GraphQL caching issues (stale GO / Lurker data)

A known caching bug in the GraphQL implementation can cause stale data
to be returned. Specifically, queries using variables:

```graphql
query MyQuery($uuid: ID!) {
  node(id: $uuid) {
    ... on NodeGoPage {
      changed {
        timestamp
      }
    }
  }
}
```

can serve stale cached data. Conversely, queries using inline
parameters bypass this stale cache:

```graphql
query MyQuery {
  node(id: "d5330804-5682-4471-a428-1d058c117740") {
    __typename
    ... on NodeGoPage {
      changed {
        timestamp
      }
    }
  }
}
```

If GO or GO Lurker is displaying stale content (such as a frontpage
showing an outdated state, even though the backend node import was
successful and skipped because it "has not changed"), rebuild the
cache on the client site:

```bash
drush cr
```

## Subscription issues

The subscription queue job queries for new content and queues node
updates for new content. As it just queues, nothing much can go wrong
here apart from GraphQL related failures. The "Last updated content"
property visible in the back-end corresponds to changed time of the
latest queued node (modulo cron run delay), so this is an indicator as
to whether the client has "seen" the newest nodes.

## Node syncing issues

The `NodeUpdate` queue worker handles the job of synchronizing new and
existing nodes, and is the most likely for failures to happen, due to
the complexity. It ought to log both success and failures with the
relevant node UUID, so look for that. Any exceptions thrown in the
process should be logged with a stack trace to ease debugging.

## "But what about?"

Even without any issues in the above, there might be a different
expectation to what should be synchronized than is actually happening.
Nodes are not copied verbatim, some fields are specially handled and
some paragraphs are not supported at all. In this case there's not
much else to do than dig into the mapper code to determine what is
actually done.
