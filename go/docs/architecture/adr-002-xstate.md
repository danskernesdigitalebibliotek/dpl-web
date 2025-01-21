# Xstate

## Context

We wanted a methodology of handling state when we have a feature set with a
growing number of different states, transitions and context.

Also we wanted to get acquainted with Xstate both because of its principle of
using a state tree and because of it's possibility of visualizing the various
scenarios/flows a user could go through.

## Decision

The search page was growing into being a problematic scenario as described above
with multiple elements and connected states to be managed:

- Searching
- Loading more results
- Filtering and loading possible filters
- Linking to a search/filtering

So we decided to implement the current early version of the search in Xstate in
order to get a transparent state tree controlling the different states and
transition to other states.

## Alternatives considered

Other state handlers where considered:

- Zustand
- Redux

## Consequences

Common to the alternatives considered is the fact that they do have the concept
of a state tree controlling which transitions are available at the various levels.

By having all the states and possible transitions between them in a Xstate machine
we have a predictable way of treating the various cases/flows a user can go through.

Also Xstate has powerful tools in order to handle side effects of the machine/actor.
One example is the [event handlers](https://stately.ai/docs/event-emitter#event-handlers) which we use for listening if a filter was toggled. When a filter is toggled
we can either set or remove a query parameter accordingly.

Even machine/actors can interact with each other, but let's see if we will ever
need that complexity.
