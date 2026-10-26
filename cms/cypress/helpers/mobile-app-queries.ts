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
