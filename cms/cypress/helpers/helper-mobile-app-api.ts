// The BFF behind the mobile apps reads content and configuration from these
// CMS endpoints. The mobile app API tests call them the way the BFF does and
// assert on what comes back.

// The BFF authenticates as the mobile GraphQL consumer user (see
// dpl_consumers.module), so the tests do too. Basic auth takes precedence over
// the admin session the tests log in with to edit content.
const mobileConsumerAuth = () => ({
  username: 'mobile_graphql',
  password: Cypress.env('MOBILE_GRAPHQL_CONSUMER_USER_PASSWORD'),
});

export const queryMobileAppGraphql = <T extends object>(
  query: string,
  variables: Record<string, unknown> = {},
) =>
  cy
    .request({
      method: 'POST',
      url: '/graphql',
      auth: mobileConsumerAuth(),
      body: { query, variables },
    })
    .then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.errors).to.equal(undefined);
      return response.body.data as T;
    });
