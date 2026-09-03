import * as React from "react";
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
  getDigitalLoanQuota,
  isCostFreeLoan,
  useDigitalLoanDecision,
  useDigitalLoanQuotas
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useBiblioAdapter from "../../../../core/utils/useBiblioAdapter";

interface MaterialAvailabilityTextOnlineProps {
  /** The digital identifier the material is lent by - see
   * getManifestationDigitalIdentifier. Shared with the loan buttons so both
   * ask the providers about the same edition. */
  identifier: string;
  materialType: ManifestationMaterialType;
}

const MaterialAvailabilityTextOnline: React.FC<
  MaterialAvailabilityTextOnlineProps
> = ({ identifier, materialType }) => {
  const isUserAnonymous = isAnonymous();
  const t = useText();
  // With the adapter enabled it is the lending provider, so its quotas are the
  // ones that apply - Publizon's would describe limits the user is no longer
  // borrowing against.
  const viaBiblioAdapter = useBiblioAdapter();

  const { data: productsData } = useGetV1ProductsIdentifier(identifier, {
    query: {
      // We never want to pass an empty string to the API
      // So we only enable the query if we have an identifier
      enabled: !!identifier && !viaBiblioAdapter
    }
  });

  const { data: libraryProfileData } = useGetV1LibraryProfile({
    query: {
      enabled: !isUserAnonymous && !viaBiblioAdapter
    }
  });
  const { data: loansData } = useGetV1UserLoans(
    {},
    {
      query: {
        enabled: !isUserAnonymous && !viaBiblioAdapter
      }
    }
  );

  const { data: digitalQuotas } = useDigitalLoanQuotas({
    enabled: !isUserAnonymous && viaBiblioAdapter
  });

  // Which licence this material would be lent under. Needed here because
  // it is what decides whether the loan costs the user anything - see
  // isCostFree below. A tolerated unknown material resolves to null and has
  // no licence to read a price from, which the falsy checks below handle.
  const { data: loanDecision } = useDigitalLoanDecision(identifier, {
    enabled: Boolean(identifier) && viaBiblioAdapter
  });

  if (!productsData && !viaBiblioAdapter) return null;

  const { patronEbookLoans, patronAudioLoans } = getPatronLoanQuotas(loansData);

  const ebookQuota = viaBiblioAdapter
    ? getDigitalLoanQuota({
        quotas: digitalQuotas,
        format: "ebook",
        period: "monthly"
      })
    : {
        current: patronEbookLoans,
        limit: libraryProfileData?.maxConcurrentEbookLoansPerBorrower
      };
  const audioQuota = viaBiblioAdapter
    ? getDigitalLoanQuota({
        quotas: digitalQuotas,
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

  // Whether the loan costs the patron nothing, which is what decides between
  // "this material is included" and the ordinary loan text.
  //
  // Publizon states it outright on the product. The service layer does not:
  // the organization configures a prioritized list of licences and can-loan
  // reports the one it picked, so which licences are cost-free is the service
  // layer's rule to know - see isCostFreeLoan.
  const isCostFree = viaBiblioAdapter
    ? isCostFreeLoan(loanDecision?.loanProvider)
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
