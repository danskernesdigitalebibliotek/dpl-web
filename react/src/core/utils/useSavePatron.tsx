import { useQueryClient } from "react-query";
import { Patron } from "./types/entities";
import { PatronSettings, Period, PincodeChange } from "@dpl/service-layer/fbs";
import {
  getGetPatronInformationByPatronIdV4QueryKey,
  useUpdateV8
} from "../fbs/fbs";
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
  const { mutate } = useUpdateV8();
  const queryClient = useQueryClient();

  const savePatron = (data: Partial<PatronSettingsFormData>) => {
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
          patron: {
            ...convertToPatronSettings({
              ...patron,
              ...data
            })
          }
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(
            getGetPatronInformationByPatronIdV4QueryKey()
          );
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
          queryClient.invalidateQueries(
            getGetPatronInformationByPatronIdV4QueryKey()
          );
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
  patronSettings: Partial<PatronSettingsFormData>
): Partial<PatronSettings> & { guardianVisibility: boolean } {
  return {
    ...patronSettings,
    emailAddresses: patronSettings.emailAddress
      ? [
          {
            emailAddress: patronSettings.emailAddress,
            receiveNotification: patronSettings.receiveEmail || false
          }
        ]
      : [],
    phoneNumbers: patronSettings.phoneNumber
      ? [
          {
            phoneNumber: patronSettings.phoneNumber,
            receiveNotification: patronSettings.receiveSms || false
          }
        ]
      : [],
    guardianVisibility: false
  };
}

export default useSavePatron;
