export const argTypes = {
  openOrderAuthenticationErrorText: {
    description: "Open order authentication error text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "An authentication error occurred" }
    }
  },
  openOrderErrorMissingPincodeText: {
    description: "Open order error missing pincode text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "Pincode is missing" }
    }
  },
  openOrderInvalidOrderText: {
    description: "Open order invalid order text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "The order is invalid" }
    }
  },
  openOrderNoServicerequesterText: {
    description: "Open order no service requester text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "Service requester is missing" }
    }
  },
  openOrderNotOwnedIllLocText: {
    description: "Open order item localized for ILL text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: {
        summary: "Your material has been ordered from another library"
      }
    }
  },
  openOrderNotOwnedNoIllLocText: {
    description: "Open order item not localized for ILL text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: {
        summary: "The material cannot be ordered from another library"
      }
    }
  },
  openOrderNotOwnedWrongIllMediumtypeText: {
    description: "Open order wrong ILL medium type text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: {
        summary: "This material type cannot be ordered from another library"
      }
    }
  },
  openOrderOrsErrorText: {
    description: "Open order ORS error text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "An error occurred while sending the order" }
    }
  },
  openOrderOwnedOwnCatalogueText: {
    description: "Open order available in own catalogue text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: {
        summary: "Item available, order through the librarys catalogue"
      }
    }
  },
  openOrderOwnedWrongMediumtypeText: {
    description: "Open order wrong medium type for available item text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "Item available but medium type not accepted" }
    }
  },
  openOrderResponseTitleText: {
    description: "Open order response title",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "Order from another library:" }
    }
  },
  openOrderServiceUnavailableText: {
    description: "Open order service unavailable text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "Service is currently unavailable" }
    }
  },
  openOrderStatusOwnedAcceptedText: {
    description: "Open order status owned accepted text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "Your order is accepted" }
    }
  },
  openOrderUnknownErrorText: {
    description: "Open order unknown error text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "An unknown error occurred" }
    }
  },
  openOrderUnknownPickupagencyText: {
    description: "Open order unknown pickup agency text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "Specified pickup agency not found" }
    }
  },
  openOrderUnknownUserText: {
    description: "Open order unknown user text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "User not found" }
    }
  },
  openOrderUserBlockedByAgencyText: {
    description: "Open order user blocked by agency text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: {
        summary: "You are blocked from making reservations at the library"
      }
    }
  },
  openOrderUserNoLongerExistOnAgencyText: {
    description: "Open order user no longer exists on agency text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: {
        summary: "You are no longer registered at the pickup library"
      }
    }
  },
  openOrderUserNotVerifiedText: {
    description: "Open order user not verified text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "Your user could not be verified" }
    }
  }
};

export default {
  openOrderAuthenticationErrorText: "An authentication error occurred",
  openOrderErrorMissingPincodeText: "Pincode is missing",
  openOrderInvalidOrderText: "The order is invalid",
  openOrderNoServicerequesterText: "Service requester is missing",
  openOrderNotOwnedIllLocText:
    "Your material has been ordered from another library",
  openOrderNotOwnedNoIllLocText:
    "The material cannot be ordered from another library",
  openOrderNotOwnedWrongIllMediumtypeText:
    "This material type cannot be ordered from another library",
  openOrderOrsErrorText: "An error occurred while sending the order",
  openOrderOwnedOwnCatalogueText:
    "Item available, order through the librarys catalogue",
  openOrderOwnedWrongMediumtypeText:
    "Item available but medium type not accepted",
  openOrderResponseTitleText: "Order from another library:",
  openOrderServiceUnavailableText: "Service is currently unavailable",
  openOrderStatusOwnedAcceptedText: "Your order is accepted",
  openOrderUnknownErrorText: "An unknown error occurred",
  openOrderUnknownPickupagencyText: "Specified pickup agency not found",
  openOrderUnknownUserText: "User not found",
  openOrderUserBlockedByAgencyText:
    "You are blocked from making reservations at the library",
  openOrderUserNoLongerExistOnAgencyText:
    "You are no longer registered at the pickup library",
  openOrderUserNotVerifiedText: "Your user could not be verified"
};

export interface OpenOrderProps {
  openOrderAuthenticationErrorText: string;
  openOrderErrorMissingPincodeText: string;
  openOrderInvalidOrderText: string;
  openOrderNoServicerequesterText: string;
  openOrderNotOwnedIllLocText: string;
  openOrderNotOwnedNoIllLocText: string;
  openOrderNotOwnedWrongIllMediumtypeText: string;
  openOrderOrsErrorText: string;
  openOrderOwnedOwnCatalogueText: string;
  openOrderOwnedWrongMediumtypeText: string;
  openOrderResponseTitleText: string;
  openOrderServiceUnavailableText: string;
  openOrderStatusOwnedAcceptedText: string;
  openOrderUnknownErrorText: string;
  openOrderUnknownPickupagencyText: string;
  openOrderUnknownUserText: string;
  openOrderUserBlockedByAgencyText: string;
  openOrderUserNoLongerExistOnAgencyText: string;
  openOrderUserNotVerifiedText: string;
}
