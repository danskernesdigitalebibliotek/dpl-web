import {
  isMaterialAvailable,
  useDigitalLoanDecision
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useBiblioAdapter from "../utils/useBiblioAdapter";
import { isAnonymous } from "../utils/helpers/user";

type DigitalAvailability = {
  // Whether the service layer answers for this material at all: the library
  // has enabled
  // it, the caller wants an answer, there is an isbn to ask about, and there
  // is a patron to ask on behalf of.
  isAnswering: boolean;
  // Null while the service layer has not answered, and when it is not being
  // asked.
  isAvailable: boolean | null;
  isLoading: boolean;
};

/**
 * Availability of an online material according to the service layer.
 *
 * With the flag on the service layer is THE lending provider: a material it
 * cannot
 * lend is not available, and Publizon must not be asked to stand in. Falling
 * back would mean offering a loan the library has decided not to make, and the
 * user would end up borrowing from the service we are migrating away from.
 *
 * The hook gates on the feature flag itself, so with the flag off it answers
 * for nothing and never touches the service layer. Whether there is a patron
 * to ask on
 * behalf of is the service layer's call - can-loan is patron-scoped - but it
 * is read here too, because the answer decides whether Publizon is asked.
 *
 * TEMPORARY, and only this part: with the service layer silent for visitors,
 * Publizon answers for them, so the two providers disagree until the service
 * layer can be asked
 * without a user. Remove the fallback then - not the gate, which stays.
 */
const useDigitalAvailability = ({
  enabled,
  isbn
}: {
  enabled: boolean;
  isbn: string | null;
}): DigitalAvailability => {
  const viaBiblioAdapter = useBiblioAdapter();
  const isAnswering =
    viaBiblioAdapter && enabled && Boolean(isbn) && !isAnonymous();

  const { data: loanDecision, isLoading } = useDigitalLoanDecision(isbn, {
    enabled: isAnswering
  });

  return {
    isAnswering,
    // null is the tolerated 404: the service layer is THE lending provider,
    // so a
    // material it does not know cannot be lent - unavailable, no fallback.
    // undefined is simply not answered yet.
    isAvailable:
      loanDecision === null
        ? false
        : ((loanDecision && isMaterialAvailable(loanDecision.status)) ?? null),
    isLoading
  };
};

export default useDigitalAvailability;
