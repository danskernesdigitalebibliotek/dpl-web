import {
  ApiResult,
  FileExtensionType,
  LoanListResult
} from "../../publizon/model";
import { UseTextFunction } from "../text";

export const getPublizonErrorStatusText = (
  error: ApiResult,
  t: UseTextFunction
): string => {
  const statusMessages: { [key: number]: string } = {
    105: `${t("publizonErrorStatusBookUnfortunatelyNotAvailableForLoanText")} (#105)`,
    114: `${t("publizonErrorStatusInvalidCardNumberPinText")} (#114)`,
    118: `${t("publizonErrorStatusAnUnexpectedErrorOccurredText")} (#118)`,
    120: `${t("publizonErrorStatusNumberOfSimultaneousLoansExceededText")} (#120)`,
    125: `${t("publizonErrorStatusMonthlyLoanLimitReachedText")} (#125)`,
    126: `${t("publizonErrorStatusMonthlyLoanLimitReachedText")} (#126)`,
    128: `${t("publizonErrorStatusBookIsNotAvailableForLoanText")} (#128)`,
    129: `${t("publizonErrorStatusBookCanOnlyBeRenewedOnceText")} (#129)`,
    130: `${t("publizonErrorStatusBookCanBeBorrowedAgainIn90DaysText")} (#130)`,
    131: `${t("publizonErrorStatusBookCannotBeBorrowedText")} (#131)`,
    133: `${t("publizonErrorStatusAnUnexpectedErrorOccurredText")} (#133)`,
    134: `${t("publizonErrorStatusCardTemporarilyBlockedText")} (#134)`,
    135: `${t("publizonErrorStatusBookCannotBeBorrowedText")} (#135)`,
    136: `${t("publizonErrorStatusBookCannotBeBorrowedText")} (#136)`,
    137: `${t("publizonErrorStatusYouCanReserveUpTo3TitlesText")} (#137)`,
    138: `${t("publizonErrorStatusAnUnexpectedErrorOccurredText")} (#138)`,
    139: `${t("publizonErrorStatusAnUnexpectedErrorOccurredText")} (#139)`,
    140: `${t("publizonErrorStatusTheBookIsAlreadyReservedText")} (#140)`,
    141: `${t("publizonErrorStatusInvalidEmailAddressText")} (#141)`,
    142: `${t("publizonErrorStatusInvalidPhoneNumberText")} (#142)`,
    143: `${t("publizonErrorStatusNumberOfSimultaneousBlueLoansExceededText")} (#143)`,
    144: `${t("publizonErrorStatusUnknownErrorAtLibraryText")} (#144)`,
    145: `${t("publizonErrorStatusLibraryServerNotRespondingText")} (#145)`,
    146: `${t("publizonErrorStatusNoAccessBecauseNotResidentText")} (#146)`,
    147: `${t("publizonErrorStatusNoCountryFoundWithGivenCountryCodeText")} (#147)`,
    148: `${t("publizonErrorStatusAnUnexpectedErrorOccurredText")} (#148)`
  };

  // Return the matching error text or a generic unknown error if code is missing
  return (
    (error?.code && statusMessages[error.code]) ||
    t("publizonErrorStatusUnknownErrorText")
  );
};

// These two functions is basically pure guesses from Gemini. It's not
// been possible to find any documentation on the meaning of
// FileExtensionType, so we'll try with this.
export const isEbookExtension = (type?: FileExtensionType): boolean => {
  return (
    type === FileExtensionType.NUMBER_2 || type === FileExtensionType.NUMBER_3
  );
};

export const isAudiobookExtension = (type?: FileExtensionType): boolean => {
  return (
    type === FileExtensionType.NUMBER_1 || type === FileExtensionType.NUMBER_4
  );
};

export const getPatronLoanQuotas = (
  loansData?: LoanListResult | null
): { patronEbookLoans: number; patronAudioLoans: number } => {
  let patronEbookLoans = 0;
  if (loansData?.userData?.totalEbookLoans) {
    patronEbookLoans = Math.abs(loansData.userData.totalEbookLoans) || 0;
  }
  let patronAudioLoans = 0;
  if (loansData?.userData?.totalAudioLoans) {
    patronAudioLoans = Math.abs(loansData.userData.totalAudioLoans) || 0;
  }

  if (loansData?.loans) {
    const ebookSubscriptionLoans = loansData.loans.filter(
      (loan) =>
        loan.isSubscriptionLoan && isEbookExtension(loan.fileExtensionType)
    ).length;
    const audioSubscriptionLoans = loansData.loans.filter(
      (loan) =>
        loan.isSubscriptionLoan && isAudiobookExtension(loan.fileExtensionType)
    ).length;

    patronEbookLoans = Math.max(0, patronEbookLoans - ebookSubscriptionLoans);
    patronAudioLoans = Math.max(0, patronAudioLoans - audioSubscriptionLoans);
  }

  return { patronEbookLoans, patronAudioLoans };
};
