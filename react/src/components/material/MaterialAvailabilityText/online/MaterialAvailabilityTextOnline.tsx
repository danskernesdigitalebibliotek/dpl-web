import * as React from "react";
import {
  useGetV1LibraryProfile,
  useGetV1ProductsIdentifier,
  useGetV1UserLoans
} from "../../../../core/publizon/publizon";
import { useText } from "../../../../core/utils/text";
import MaterialAvailabilityTextParagraph from "../generic/MaterialAvailabilityTextParagraph";
import { ManifestationMaterialType } from "../../../../core/utils/types/material-type";
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
import { hasValue } from "../../../../core/utils/helpers/has-value";

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

  // Only read for its licence - see isCostFree below.
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

  // Publizon states cost-free outright on the product. The service layer
  // reports the licence can-loan picked; which licences are cost-free is its
  // rule to know - see isCostFreeLoan.
  const isCostFree = viaBiblioAdapter
    ? isCostFreeLoan(loanDecision?.loanProvider)
    : Boolean(productsData?.product?.costFree);

  // We always show the helper text even when the title doesn't count towards the user's quota.
  if (isCostFree) {
    return (
      <MaterialAvailabilityTextParagraph>
        {t("materialIsIncludedText")}
      </MaterialAvailabilityTextParagraph>
    );
  }

  // We don't show quota information when users are logged out
  if (isUserAnonymous) {
    return null;
  }

  if (isPlayerType(materialType)) {
    if (!hasValue(audioQuota.current) || !hasValue(audioQuota.limit)) {
      return null;
    }

    return (
      <MaterialAvailabilityTextParagraph>
        {t("onlineLimitMonthAudiobookInfoText", {
          placeholders: {
            "@count": audioQuota.current,
            "@limit": audioQuota.limit
          }
        })}
      </MaterialAvailabilityTextParagraph>
    );
  }

  if (isReaderType(materialType)) {
    if (!hasValue(ebookQuota.current) || !hasValue(ebookQuota.limit)) {
      return null;
    }

    return (
      <MaterialAvailabilityTextParagraph>
        {t("onlineLimitMonthEbookInfoText", {
          placeholders: {
            "@count": ebookQuota.current,
            "@limit": ebookQuota.limit
          }
        })}
      </MaterialAvailabilityTextParagraph>
    );
  }

  return null;
};

export default MaterialAvailabilityTextOnline;

const isReaderType = (type: ManifestationMaterialType) =>
  readerTypes.includes(type);

const isPlayerType = (type: ManifestationMaterialType) =>
  playerTypes.includes(type);
