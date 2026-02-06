# Data mocking

## Context

We needed to find a unified way to use mocked data inside Cypress tests and API-requests in Storybook.
The solution had to offer type safety as our generated graphql services have shown to change sporadically.
Going forward the usage of simple .json files would not suffice, as issues within would only showup when running into React errors, as neither Cypress or Storybook "knows" what the data is supposed to look like.

## Decision

The decision fell upon Fishery which is a small JS tool that allows the creation of data factories, where atomic objects are created against a given type and inherited to create a given data structure, that matches responses of endpoints in the application.
Fishery offers a well-documented API and some powerful chaining abilities, which makes it very flexible for defining advanced data factories.

## Usage

```typescript
// A simple userFactory defined with mocked data
// while building we can provide overrides for edge cases
// factories/user.ts
import { Factory } from "fishery"

import { User } from "../my-types"
import postFactory from "./post"

const userFactory = Factory.define<User>(({ sequence }) => ({
  id: sequence,
  name: "Rosa",
  address: { city: "Austin", state: "TX", country: "USA" },
  posts: postFactory.buildList(2),
}))

const user = userFactory.build({
  name: "Susan",
  address: { city: "El Paso" },
})

user.name // Susan
user.address.city // El Paso
user.address.state // TX (from factory)
```

## Alternatives considered

We did not actively look into other JS based alternatives, but briefly considered if it would cause too much overhead, as it requires more time to define a Factory than a simple .json file

## Consequences

Advanced API responses WILL take more time to define as factories, because we can only benefit from Fishery, if data is split up into reusable atomic objects.
But it is required that each developer takes their time to define a Factory, as it will benefit adding changes in the future.
