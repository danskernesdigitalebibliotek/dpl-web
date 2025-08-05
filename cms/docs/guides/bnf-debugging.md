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

## Subscription issues

The subscription queue job queries for new content and queues node
updates for new content. As it just queues, nothing much can go wrong
here apart from GraphQL related failuers. The "Last updated content"
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
