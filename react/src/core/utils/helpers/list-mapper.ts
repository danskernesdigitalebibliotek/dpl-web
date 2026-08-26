import { head, keys, values } from "lodash";
import {
  DigitalLoan,
  DigitalMaterial,
  MaterialType,
  DigitalReservation
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import { LoanV2, ReservationDetailsV2 } from "../../fbs/model";
import { FaustId } from "../types/ids";
import { ManifestationBasicDetailsFragment } from "../../dbc-gateway/generated/graphql";
import { BasicDetailsType } from "../types/basic-details-type";
import { Product, Loan, Reservation } from "../../publizon/model";
import {
  PUBLIZON_PRODUCT_TYPE,
  isPublizonProductType
} from "../../publizon/productType";
import { LoanType } from "../types/loan-type";
import { store } from "../../store";
import { ReservationType } from "../types/reservation-type";
import { getContributors } from "./general";
import { ReservationGroupDetails } from "../useGetReservationGroups";
import {
  dashboardReadyForPickupApiValueText,
  dashboardReservedApiValueText
} from "../../configuration/api-strings";

function getYearFromDataString(date: string) {
  return new Date(date).getFullYear();
}

function getSeriesString(
  series: ManifestationBasicDetailsFragment["series"],
  workId: string
) {
  return series
    .map(({ title, members }) => {
      const currentMember = members.find(
        (member) => member.work.workId === workId
      );
      if (currentMember?.numberInSeries) {
        return `${title} ${currentMember.numberInSeries}`;
      }
      return title;
    })
    .join(", ");
}

// Loan is a loan from Publizon, and is the equivalent
// to the LoanV2 type in FBS. These are mapped to the same
// so digital/physical loans/reservations can use the same components,
// as their UI is often quite similar
export const mapPublizonLoanToLoanType = (list: Loan[]): LoanType[] => {
  return list.map(
    ({ loanExpireDateUtc, orderDateUtc, libraryBook, orderId }) => {
      return {
        dueDate: loanExpireDateUtc,
        loanDate: orderDateUtc,
        isRenewable: false,
        materialItemNumber: libraryBook?.identifier || "",
        renewalStatusList: [],
        loanType: null,
        identifier: libraryBook?.identifier || null,
        faust: null,
        loanId: null,
        orderId,
        digitalProvider: "publizon" as const
      };
    }
  );
};

// digital-loan-card picks the reader/player button from Publizon's integer
// enum, so a Biblio material type has to be expressed in those numbers too.
// Goes away with the Publizon integration, when the card stops keying on
// Publizon's enum.
const digitalProductTypeFor = (materialType: MaterialType) =>
  materialType === "audiobook"
    ? PUBLIZON_PRODUCT_TYPE.AUDIOBOOK
    : PUBLIZON_PRODUCT_TYPE.EBOOK;

const digitalMaterialTypeText = (materialType: MaterialType) => {
  const {
    text: { data: texts }
  } = store.getState();

  return materialType === "audiobook"
    ? texts.publizonAudioBookText
    : texts.publizonEbookText;
};

// The catalogue fields a Biblio loan carries, as a BasicDetailsType.
const mapDigitalLoanToBasicDetailsType = (loan: DigitalLoan) => {
  // A loan states its author as one string, where the metadata endpoints use
  // a list.
  const authors = loan.author ? [loan.author] : [];

  return {
    title: loan.title,
    periodical: null,
    year: loan.publishDate ? getYearFromDataString(loan.publishDate) : "",
    materialType: digitalMaterialTypeText(loan.materialType),
    digitalProductType: digitalProductTypeFor(loan.materialType),
    externalProductId: loan.materialId,
    authors: getContributors(false, authors),
    authorsShort: getContributors(true, authors)
  } as BasicDetailsType;
};

// DigitalLoan is a digital loan from the Biblio adapter (WeDoBooks), and is
// the equivalent to the Loan type in Publizon. These are mapped to the same
// so components can treat loans from all three providers alike.
export const mapDigitalLoanToLoanType = (list: DigitalLoan[]): LoanType[] => {
  return list.map((loan) => {
    const { loanId, materialId, startDate, endDate } = loan;
    return {
      dueDate: endDate,
      loanDate: startDate,
      isRenewable: false,
      materialItemNumber: materialId,
      renewalStatusList: [],
      loanType: null,
      identifier: materialId,
      faust: null,
      loanId: null,
      // The Biblio loan id plays the same role as Publizon's order id: the
      // key used to open the loan in the reader/player.
      orderId: loanId,
      digitalProvider: "biblio" as const,
      // A Biblio loan carries its own catalogue fields, so the list can
      // render it without a separate metadata lookup.
      details: mapDigitalLoanToBasicDetailsType(loan)
    };
  });
};

// LoanV2 is a loan from FBS, and is the equivalent
// to the Loan type in Publizon. These are mapped to the same
// so digital/physical loans/reservations can use the same components,
// as their UI is often quite similar
export const mapFBSLoanToLoanType = (list: LoanV2[]): LoanType[] => {
  return list.map(({ loanDetails, isRenewable, renewalStatusList }) => {
    return {
      dueDate: loanDetails.dueDate,
      loanDate: loanDetails.loanDate,
      periodical: loanDetails.periodical?.displayText || "",
      renewalStatusList,
      isRenewable,
      materialItemNumber: loanDetails.materialItemNumber,
      loanType: loanDetails.loanType,
      identifier: null,
      faust: (loanDetails.recordId as FaustId) || null,
      loanId: loanDetails.loanId,
      details: loanDetails.ilBibliographicRecord
        ? {
            title: loanDetails.ilBibliographicRecord.title,
            authors: loanDetails.ilBibliographicRecord.author,
            authorsShort: loanDetails.ilBibliographicRecord.author,
            firstAuthor: loanDetails.ilBibliographicRecord.author,
            year: loanDetails.ilBibliographicRecord.publicationDate,
            lang: loanDetails.ilBibliographicRecord.language
          }
        : null
    };
  });
};

// Product is a material from Publizon, and is the equivalent
// to a manifestation from FBI. These are mapped to the same
// so digital/physical loans/reservations can use the same components,
// as their UI is often quite similar
export const mapProductToBasicDetailsType = (material: Product) => {
  const {
    publicationDate,
    title,
    description,
    productType,
    contributors,
    externalProductId,
    languageCode
  } = material;
  // Todo this is sortof a hack, but using t: UseTextFunction as argument
  // makes the components re-render.
  const {
    text: { data: texts }
  } = store.getState();

  const digitalProductType: { [key: number]: string } = {
    [PUBLIZON_PRODUCT_TYPE.EBOOK]: texts.publizonEbookText,
    [PUBLIZON_PRODUCT_TYPE.AUDIOBOOK]: texts.publizonAudioBookText,
    [PUBLIZON_PRODUCT_TYPE.PODCAST]: texts.publizonPodcastText
  };

  const authors =
    contributors?.map(
      ({ firstName, lastName }) => `${firstName} ${lastName}`
    ) || [];

  return {
    title,
    lang: languageCode,
    periodical: null,
    year: publicationDate ? getYearFromDataString(publicationDate) : "",
    description,
    materialType: productType ? digitalProductType[productType] : "",
    digitalProductType: isPublizonProductType(productType) ? productType : null,
    externalProductId: externalProductId?.id,
    authors: contributors ? getContributors(false, authors) : "",
    authorsShort: contributors ? getContributors(true, authors) : ""
  } as BasicDetailsType;
};

// DigitalMaterial is a material from the Biblio adapter, and is the equivalent
// to the Product type in Publizon.
export const mapDigitalMaterialToBasicDetailsType = (
  material: DigitalMaterial
) => {
  return {
    title: material.title,
    lang: head(material.languages),
    periodical: null,
    year: material.publishDate
      ? getYearFromDataString(material.publishDate)
      : "",
    description: material.description,
    materialType: digitalMaterialTypeText(material.materialType),
    digitalProductType: digitalProductTypeFor(material.materialType),
    externalProductId: material.isbn,
    authors: getContributors(false, material.authors),
    authorsShort: getContributors(true, material.authors)
  } as BasicDetailsType;
};

// Manifestation is a material manifestation from FBI, and is the equivalent
// to the Product type in Publizon. These are mapped to the same
// so digital/physical loans/reservations can use the same components,
// as their UI is often quite similar
export const mapManifestationToBasicDetailsType = (
  material: ManifestationBasicDetailsFragment
) => {
  const {
    edition,
    abstract,
    titles,
    pid,
    ownerWork,
    materialTypes,
    creators,
    series,
    languages
  } = material;
  const languageCode = languages?.main?.[0]?.iso639Set1 ?? "";
  const description = abstract ? abstract[0] : "";
  const {
    full: [fullText]
  } = titles || { full: [] };
  const { publicationYear } = edition || {};
  const { display: year } = publicationYear || {};

  const inputContributorsArray = creators?.map(({ display }) => display) || [];
  const firstAuthor = creators && creators.length ? creators[0].display : "";

  return {
    lang: languageCode,
    authors: getContributors(false, inputContributorsArray),
    authorsShort: getContributors(true, inputContributorsArray),
    firstAuthor,
    pid,
    title: fullText,
    year,
    description,
    series:
      series &&
      series.length > 0 &&
      series[0].members &&
      series[0].members.length > 0
        ? getSeriesString(series, ownerWork.workId)
        : "",
    materialType: materialTypes
      ? materialTypes[0].materialTypeSpecific.display
      : undefined
  } as BasicDetailsType;
};

// Reservation is a reservation from Publizon, and is the equivalent
// to the ReservationDetailsV2 type in FBS. These are mapped to the same
// so digital/physical loans/reservations can use the same components,
// as their UI is often quite similar
export const mapPublizonReservationToReservationType = (
  list: Reservation[]
): ReservationType[] => {
  return list.map(
    ({
      identifier,
      createdDateUtc,
      status,
      expectedRedeemDateUtc,
      productTitle,
      expireDateUtc
    }) => {
      const publizonReservationState: { [key: number]: string } = {
        1: "reserved", // in publizon Queued
        2: "readyForPickup", // in publizon Redeemable
        3: "redeemed", // in publizon Redeemed
        4: "cancelled", // in publizon Cancelled
        5: "expired" // in publizon Expired
      };

      const state = status ? publizonReservationState[status] : null;

      return {
        identifier,
        faust: null,
        dateOfReservation: createdDateUtc,
        expiryDate: expireDateUtc,
        state,
        title: productTitle,
        pickupDeadline: expectedRedeemDateUtc
      };
    }
  );
};

// DigitalReservation is a reservation from the Biblio adapter, and is the
// equivalent to the Reservation type in Publizon.
export const mapDigitalReservationToReservationType = (
  list: DigitalReservation[]
): ReservationType[] => {
  return list.map(
    ({
      reservationId,
      materialId,
      createdDate,
      expectedLoanDate,
      offerId,
      offerExpiresAt
    }) => {
      return {
        identifier: materialId,
        faust: null,
        dateOfReservation: createdDate,
        // An offered reservation is waiting to be accepted as a loan, which
        // is what "ready for pickup" means for a digital material. Without an
        // offer the user is still queued.
        state: offerId
          ? dashboardReadyForPickupApiValueText
          : dashboardReservedApiValueText,
        // The offer is what expires - the reservation itself has no end date.
        expiryDate: offerExpiresAt ?? null,
        pickupDeadline: expectedLoanDate,
        // Biblio reservations carry no title. It is resolved from the
        // material metadata by the same HOC that describes digital loans.
        title: null,
        biblioReservationId: reservationId
      };
    }
  );
};

// ReservationDetailsV2 is a reservation from FBS, and is the equivalent
// to the Reservation type in Publizon. These are mapped to the same
// so digital/physical loans/reservations can use the same components,
// as their UI is often quite similar
export const mapFBSReservationToReservationType = (
  list: ReservationDetailsV2[]
): ReservationType[] => {
  return list.map(
    ({
      recordId,
      dateOfReservation,
      expiryDate,
      numberInQueue,
      state,
      pickupBranch,
      pickupDeadline,
      pickupNumber,
      reservationId,
      periodical,
      reservationType
    }) => {
      return {
        periodical: periodical?.displayText || "",
        faust: recordId as FaustId,
        dateOfReservation,
        expiryDate,
        numberInQueue,
        state: state === "readyForPickup" ? "readyForPickup" : "reserved",
        pickupBranch,
        pickupDeadline,
        pickupNumber,
        reservationIds: [reservationId],
        reservationType
      };
    }
  );
};

export const mapFBSReservationGroupToReservationType = (
  list: ReservationGroupDetails[]
): ReservationType[] => {
  return list.map(
    ({
      dateOfReservation,
      expiryDate,
      numberInQueue,
      state,
      pickupBranch,
      pickupDeadline,
      pickupNumber,
      periodical,
      records,
      ilBibliographicRecord
    }) => {
      return {
        periodical: periodical?.displayText || "",
        faust: head(keys(records)) as FaustId,
        dateOfReservation,
        expiryDate,
        numberInQueue,
        state: state === "readyForPickup" ? "readyForPickup" : "reserved",
        pickupBranch,
        pickupDeadline,
        pickupNumber,
        reservationIds: values(records),
        details: ilBibliographicRecord
          ? {
              title: ilBibliographicRecord.title,
              authors: ilBibliographicRecord.author,
              authorsShort: ilBibliographicRecord.author,
              firstAuthor: ilBibliographicRecord.author,
              year: ilBibliographicRecord.publicationDate,
              lang: ilBibliographicRecord.language
            }
          : null
      };
    }
  );
};

export default {};
