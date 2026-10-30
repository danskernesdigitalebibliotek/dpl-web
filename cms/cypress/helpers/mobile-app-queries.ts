// GraphQL queries for the mobile app API tests. We do not know exactly which
// fields the BFF behind the mobile apps asks for, so every query selects every
// field in the schema. A field added to the schema should be added here too.

export const gqlQueries = {
  GET_APP_BRAND_SETTINGS: `query {
    getAppBrandSettings {
      logoUrl
    }
  }`,
  GET_APP_FEES_AND_PAYMENT_INFO: `query {
    getAppFeesAndPaymentInfo {
      feesAndReplacementCostsUrl
      paymentSiteUrl
      paymentSiteButtonLabel
    }
  }`,
  // Only selects the element types the tests create. Element types with
  // fields of the same name but different nullability (title is String on
  // some and String! on others) cannot be selected together without aliases,
  // so add them as tests for them are written.
  GET_APP_PAGE: `query ($id: String!) {
    getAppPage(id: $id) {
      title
      subtitle
      image
      elements {
        __typename
        id
        ... on AppContentElementText {
          body
        }
      }
    }
  }`,
  // See GET_APP_PAGE on which element types are selected.
  GET_APP_CATEGORIES: `query ($type: AppType!, $id: String) {
    getAppCategories(type: $type, id: $id) {
      id
      title
      icon
      elements {
        __typename
        id
        ... on AppContentElementText {
          body
        }
        ... on AppContentElementGoLinkbox {
          title
          color
          description
          image
          contentId
        }
      }
    }
  }`,
  GET_BRANCHES: `query (
    $isilId: String
    $availabilityContexts: [String!]
    $cmsConfigured: Boolean
  ) {
    getBranches(
      isilId: $isilId
      availabilityContexts: $availabilityContexts
      cmsConfigured: $cmsConfigured
    ) {
      isilId
      title
      address {
        street
        postalCode
        city
        country
      }
      phone
      email
      availabilityContext {
        search
        availability
        reservations
      }
    }
  }`,
  GET_RESERVATION_SETTINGS: `query {
    reservationSettings {
      smsNotificationsEnabled
      interestPeriods {
        all {
          value
          label
        }
        default {
          value
          label
        }
      }
      allowRemoveReadyReservations
      urls {
        pauseReservationInfo
        zeroHitsSearch
      }
    }
  }`,
};
