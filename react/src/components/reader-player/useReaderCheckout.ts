import { useQuery } from "@tanstack/react-query";
import type {
  WedoBooksCheckout,
  WedoBooksSdk
} from "@danskernesdigitalebibliotek/dpl-wedobooks";
import useReaderSdk from "./useReaderSdk";

/**
 * The signed-in SDK and the entitlement the reader or player opens - both,
 * because neither is usable without the other.
 *
 * A loan from the service layer looks almost exactly like the SDK's checkout -
 * same field names, same meaning - but not quite: the player needs fields the
 * adapter does not return, and the two disagree on how dates and authors are
 * shaped. Rather than translate, we let the SDK hand us its own record, which
 * also confirms at runtime that the adapter's loan id really is the SDK's
 * checkout id.
 *
 * `checkout` is null when the SDK does not recognise the loan, which is the
 * signal that it cannot be opened.
 */
const useReaderCheckout = (
  loanId: string | null
): { sdk: WedoBooksSdk | undefined; checkout: WedoBooksCheckout | null } => {
  const { data: sdk } = useReaderSdk();

  const { data: checkout } = useQuery<WedoBooksCheckout | null>({
    queryKey: ["reader", "checkout", loanId],
    enabled: Boolean(loanId) && Boolean(sdk),
    // The reader and the player bind to the entitlement once and key on its
    // id, so a refetched copy would never reach the mounted component.
    staleTime: Infinity,
    // As in useReaderSdk: a loan the SDK cannot fetch has to say so rather
    // than leave the reader blank.
    throwOnError: true,
    queryFn: async () => {
      // Both are guaranteed by `enabled`.
      const found = await sdk!.loans.getLoan(loanId!);
      return found ?? null;
    }
  });

  return { sdk, checkout: checkout ?? null };
};

export default useReaderCheckout;
