import {
  isBiblioMaterialAvailable,
  useBiblioCanLoan
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useBiblioAdapter from "../utils/useBiblioAdapter";
import { isAnonymous } from "../utils/helpers/user";

type BiblioAvailability = {
  // Whether Biblio answers for this material at all: the library has enabled
  // it, the caller wants an answer, there is an isbn to ask about, and there
  // is a patron to ask on behalf of.
  isAnswering: boolean;
  // Null while Biblio has not answered, and when it is not being asked.
  isAvailable: boolean | null;
  isLoading: boolean;
};

/**
 * Availability of an online material according to the Biblio adapter.
 *
 * With the flag on Biblio is THE lending provider: a material it cannot
 * lend is not available, and Publizon must not be asked to stand in. Falling
 * back would mean offering a loan the library has decided not to make, and the
 * user would end up borrowing from the service we are migrating away from.
 *
 * The hook gates on the feature flag itself, so with the flag off it answers
 * for nothing and never touches Biblio. Whether there is a patron to ask on
 * behalf of is the service layer's call - can-loan is patron-scoped - but it
 * is read here too, because the answer decides whether Publizon is asked.
 *
 * TEMPORARY, and only this part: with Biblio silent for visitors, Publizon
 * answers for them, so the two providers disagree until Biblio can be asked
 * without a user. Remove the fallback then - not the gate, which stays.
 */
const useBiblioAvailability = ({
  enabled,
  isbn
}: {
  enabled: boolean;
  isbn: string | null;
}): BiblioAvailability => {
  const useBiblio = useBiblioAdapter();
  const isAnswering = useBiblio && enabled && Boolean(isbn) && !isAnonymous();

  const { data: canLoan, isLoading } = useBiblioCanLoan(isbn, {
    enabled: isAnswering
  });

  return {
    isAnswering,
    isAvailable: canLoan ? isBiblioMaterialAvailable(canLoan.status) : null,
    isLoading
  };
};

export default useBiblioAvailability;
