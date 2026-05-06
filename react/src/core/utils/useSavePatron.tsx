import { useQueryClient } from "react-query";
import { Patron } from "./types/entities";
import type { PatronSettings as SLPatronSettings } from "@dpl/service-layer/fbs";
import { Period, PincodeChange } from "@dpl/service-layer/fbs";
import { fbsQueryKeys, useUpdatePatron } from "../fbs/hooks";
import useUserInfo from "../adgangsplatformen/useUserInfo";
import { isAnonymous } from "./helpers/user";

// Form-level type for patron settings input. Uses single email/phone fields
// which get converted to the API's array format via convertToPatronSettings.
export type PatronSettingsFormData = {
  emailAddress?: string;
  phoneNumber?: string;
  preferredPickupBranch: string;
  receiveEmail: boolean;
  receivePostalMail: boolean;
  receiveSms: boolean;
  onHold?: Period;
  preferredLanguage?: string;
  notificationProtocols?: string[];
};

export interface FetchHandlers {
  onSuccess?: () => void;
  onError?: () => void;
}

interface UseSavePatron {
  patron?: Patron;
  fetchHandlers?: {
    savePatron?: FetchHandlers;
    savePincode?: FetchHandlers;
  };
}

const useSavePatron = ({ patron, fetchHandlers }: UseSavePatron) => {
  const { data: userInfo } = useUserInfo({
    enabled: !isAnonymous()
  });
  const { mutate } = useUpdatePatron();
  const queryClient = useQueryClient();

  const savePatron = (data: Partial<PatronSettingsFormData> = {}) => {
    const { onSuccess, onError } = fetchHandlers?.savePatron || {};

    if (!patron || !userInfo) {
      // eslint-disable-next-line no-console
      console.error("Patron or userInfo is not defined");
      return;
    }

    mutate(
      {
        data: {
          pincodeChange: {
            pincode: userInfo.attributes.pincode,
            libraryCardNumber: patron.patronId.toString()
          },
          patron: convertToPatronSettings({ ...patron, ...data })
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(fbsQueryKeys.patronInfo());
          if (onSuccess) {
            onSuccess();
          }
        },
        // todo error handling
        onError: () => {
          if (onError) {
            onError();
          }
        }
      }
    );
  };

  const savePincode = (data: PincodeChange) => {
    const { onSuccess, onError } = fetchHandlers?.savePincode || {};
    if (!patron) {
      return;
    }

    mutate(
      {
        data: { pincodeChange: data }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(fbsQueryKeys.patronInfo());
          if (onSuccess) {
            onSuccess();
          }
        },
        // todo error handling
        onError: () => {
          if (onError) {
            onError();
          }
        }
      }
    );
  };

  return { savePatron, savePincode };
};

export function convertToPatronSettings(
  patronSettings: PatronSettingsFormData
): SLPatronSettings {
  const { emailAddress, phoneNumber, receiveEmail, receiveSms, ...rest } =
    patronSettings;

  return {
    ...rest,
    emailAddresses: emailAddress
      ? [{ emailAddress, receiveNotification: receiveEmail || false }]
      : [],
    phoneNumbers: phoneNumber
      ? [{ phoneNumber, receiveNotification: receiveSms || false }]
      : [],
    guardianVisibility: false
  };
}

export default useSavePatron;
