// GraphQL queries for the mobile app API tests. We do not know exactly which
// fields the BFF behind the mobile apps asks for, so every query selects every
// field in the schema. A field added to the schema should be added here too.

// Every element type, also the video ones the tests cannot create, as they
// need the VideoTool API. Selecting them still fails the tests when their
// fields change. Fields of the same name but different nullability (title is
// String on some types and String! on others) cannot be selected together, so
// the nullable ones are aliased.
const APP_CONTENT_ELEMENT_FIELDS = `
  __typename
  id
  ... on AppContentElementText {
    body
  }
  ... on AppContentElementVideo {
    nullableTitle: title
    video {
      url
      thumbnail
      orientation
    }
  }
  ... on AppContentElementVideoBundleManual {
    title
    workIds
    video {
      url
      thumbnail
      orientation
    }
  }
  ... on AppContentElementVideoBundleAutomatic {
    title
    cql
    limit
    video {
      url
      thumbnail
      orientation
    }
  }
  ... on AppContentElementNavSpotsManual {
    linkedPages
  }
  ... on AppContentElementRecommendation {
    imagePositionRight
    nullableTitle: title
    nullableDescription: description
    workId
  }
  ... on AppContentElementGoMaterialSliderAutomatic {
    title
    cql
    limit
  }
  ... on AppContentElementGoMaterialSliderManual {
    title
    workIds
  }
  ... on AppContentElementMaterialGridAutomatic {
    nullableTitle: title
    nullableDescription: description
    cql
    limit
    priorityMaterialType
  }
  ... on AppContentElementMaterialGridManual {
    nullableTitle: title
    nullableDescription: description
    workIds
  }
  ... on AppContentElementGoLinkbox {
    title
    color
    description
    image
    contentId
  }
`;

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
  GET_APP_PAGE: `query ($id: String!) {
    getAppPage(id: $id) {
      title
      subtitle
      image
      elements {
        ${APP_CONTENT_ELEMENT_FIELDS}
      }
    }
  }`,
  GET_APP_CATEGORIES: `query ($type: AppType!, $id: String) {
    getAppCategories(type: $type, id: $id) {
      id
      title
      icon
      elements {
        ${APP_CONTENT_ELEMENT_FIELDS}
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
