import * as React from "react";
import { first } from "lodash";
import {
  useGetV1LibraryProfile,
  useGetV1ProductsIdentifier,
  useGetV1UserLoans
} from "../../../../core/publizon/publizon";
import { useText } from "../../../../core/utils/text";
import MaterialAvailabilityTextParagraph from "../generic/MaterialAvailabilityTextParagraph";
import { ManifestationMaterialType } from "../../../../core/utils/types/material-type";
import { AvailabilityTextMap, getAvailabilityText } from "./helper";
import { playerTypes, readerTypes } from "../../../reader-player/helper";
import { isAnonymous } from "../../../../core/utils/helpers/user";
import { getPatronLoanQuotas } from "../../../../core/utils/helpers/publizon";
import {
  getBiblioLoanQuota,
  useBiblioCanLoan,
  useBiblioLoanQuotas
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useBiblioAdapter from "../../../../core/utils/useBiblioAdapter";
import useBiblioTolerateUnknownMaterials from "../../../../core/biblio/useBiblioTolerateUnknownMaterials";

interface MaterialAvailabilityTextOnlineProps {
  isbns: string[];
  materialType: ManifestationMaterialType;
}

const MaterialAvailabilityTextOnline: React.FC<
  MaterialAvailabilityTextOnlineProps
> = ({ isbns, materialType }) => {
  const isUserAnonymous = isAnonymous();
  const t = useText();
  const useBiblio = useBiblioAdapter();
  const isbn = first(isbns) || "";

  // With the adapter enabled it is the lending provider, so its quotas are the
  // ones that apply - Publizon's would describe limits the user is no longer
  // borrowing against.
  const isProvidedByBiblio = useBiblio;
  const isProvidedByPublizon = !useBiblio;

  const { data: productsData } = useGetV1ProductsIdentifier(isbn, {
    query: {
      // We never want to pass an empty string to the API
      // So we only enable the query if we have an isbn
      enabled: !!isbn && isProvidedByPublizon
    }
  });

  const { data: libraryProfileData } = useGetV1LibraryProfile({
    query: {
      enabled: !isUserAnonymous && isProvidedByPublizon
    }
  });
  const { data: loansData } = useGetV1UserLoans(
    {},
    {
      query: {
        enabled: !isUserAnonymous && isProvidedByPublizon
      }
    }
  );

  const { data: biblioQuotas } = useBiblioLoanQuotas({
    enabled: !isUserAnonymous && isProvidedByBiblio
  });

  // Which licence Biblio would lend this material under. Needed here because
  // it is what decides whether the loan costs the user anything - see
  // isCostFree below.
  // TEMPORARY, see useBiblioTolerateUnknownMaterials: an unknown material
  // has no licence to read a price from, which the falsy checks below
  // already handle.
  const tolerateUnknown = useBiblioTolerateUnknownMaterials();
  const { data: biblioCanLoan } = useBiblioCanLoan(isbn, {
    enabled: Boolean(isbn) && isProvidedByBiblio,
    allowNotFound: tolerateUnknown
  });

  if (!productsData && !isProvidedByBiblio) return null;

  const { patronEbookLoans, patronAudioLoans } = getPatronLoanQuotas(loansData);

  const ebookQuota = isProvidedByBiblio
    ? getBiblioLoanQuota({
        quotas: biblioQuotas,
        format: "ebook",
        period: "monthly"
      })
    : {
        current: patronEbookLoans,
        limit: libraryProfileData?.maxConcurrentEbookLoansPerBorrower
      };
  const audioQuota = isProvidedByBiblio
    ? getBiblioLoanQuota({
        quotas: biblioQuotas,
        format: "audiobook",
        period: "monthly"
      })
    : {
        current: patronAudioLoans,
        limit: libraryProfileData?.maxConcurrentAudioLoansPerBorrower
      };

  const availabilityTextMap: AvailabilityTextMap = {
    ...readerTypes.reduce((acc, type) => {
      if (isUserAnonymous) return acc;

      return {
        ...acc,
        [type]: {
          text: "onlineLimitMonthEbookInfoText",
          count: ebookQuota.current,
          limit: ebookQuota.limit
        }
      };
    }, {}),
    ...playerTypes.reduce((acc, type) => {
      if (isUserAnonymous) return acc;

      return {
        ...acc,
        [type]: {
          text: "onlineLimitMonthAudiobookInfoText",
          count: audioQuota.current,
          limit: audioQuota.limit
        }
      };
    }, {}),
    materialIsIncluded: {
      text: "materialIsIncludedText"
    }
  };

  // Whether the loan costs the user nothing, which is what decides between
  // "this material is included" and the ordinary loan text.
  //
  // Publizon states it outright on the product. Biblio does not: the
  // organization configures a prioritized list of licences, and can-loan
  // reports the one it picked for this material. "selection" is the licence
  // Danish blue titles answer with, verified against the real adapter by
  // borrowing one and watching the quota counters stand still. The rest
  // ("click" is pay-per-loan, "package" is a subscription, and so on) are
  // ways the LIBRARY pays, and the loan still counts against the user's
  // quota - including, for now, the unobserved "free", whose semantics DBC
  // has yet to confirm.
  //
  // The field is optional by contract, and absent means no provider could be
  // picked at all - so nothing to promise the user either.
  const isCostFree = isProvidedByBiblio
    ? biblioCanLoan?.loanProvider === "selection"
    : Boolean(productsData?.product?.costFree);

  const availabilityTextType = isCostFree ? "materialIsIncluded" : materialType;

  const availabilityText = getAvailabilityText({
    type: availabilityTextType,
    map: availabilityTextMap,
    t
  });

  return (
    <MaterialAvailabilityTextParagraph>
      {availabilityText}
    </MaterialAvailabilityTextParagraph>
  );
};

export default MaterialAvailabilityTextOnline;
