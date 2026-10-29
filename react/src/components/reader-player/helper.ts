import { getMaterialTypes } from "../../core/utils/helpers/general";
import { Manifestation } from "../../core/utils/types/entities";
import { LoanType } from "../../core/utils/types/loan-type";
import { ManifestationMaterialType } from "../../core/utils/types/material-type";
import { ReservationType } from "../../core/utils/types/reservation-type";
import {
  getLoanableManifestation,
  getManifestationDigitalIdentifier
} from "../../apps/material/helper";
import { DigitalProvider } from "../../core/utils/types/digital-provider";
import { DigitalMaterialId } from "../../core/utils/types/ids";

type AssetType = {
  src: string;
  type: "script" | "link";
  id: string;
};

export const playerAssets: AssetType[] = [
  {
    src: "https://play.pubhub.dk/1.3.0/js/player-kernel.min.js",
    type: "script",
    id: "player-kernel-js"
  }
];

export const readerAssets: AssetType[] = [
  {
    src: "https://reader.pubhub.dk/2.2.0/js/chunk-vendors.js",
    type: "script",
    id: "reader-chunk-vendors-js"
  },
  {
    src: "https://reader.pubhub.dk/2.2.0/js/app.js",
    type: "script",
    id: "reader-app-js"
  },
  {
    src: "https://reader.pubhub.dk/2.2.0/css/chunk-vendors.css",
    type: "link",
    id: "reader-chunk-vendors-css"
  },
  {
    src: "https://reader.pubhub.dk/2.2.0/css/app.css",
    type: "link",
    id: "reader-app-css"
  }
];

const appendedAssets = new Set<HTMLElement>();

export const appendAsset = ({ src, type, id }: AssetType) => {
  if (type === "script") {
    const scriptElement = document.createElement("script");
    scriptElement.src = src;
    scriptElement.defer = true;
    scriptElement.async = false;
    scriptElement.type = "module";
    scriptElement.id = id;
    document.head.appendChild(scriptElement);
    appendedAssets.add(scriptElement);
  }

  if (type === "link") {
    const linkElement = document.createElement("link");
    linkElement.href = src;
    linkElement.rel = "stylesheet";
    linkElement.id = id;
    document.head.appendChild(linkElement);
    appendedAssets.add(linkElement);
  }
};

export const removeAppendedAssets = () => {
  appendedAssets.forEach((element) => {
    if (document.head.contains(element)) {
      document.head.removeChild(element);
    }
    appendedAssets.delete(element);
  });
};

export const getOrderIdByIdentifier = ({
  loans,
  identifier
}: {
  loans: LoanType[];
  identifier: DigitalMaterialId;
}) => {
  const loanWithIdentifier = loans.find((i) => i.identifier === identifier);
  return loanWithIdentifier ? loanWithIdentifier.orderId : null;
};

/**
 * Where a digital loan opens. One url parameter per provider, because the two
 * readers do not recognise each other's keys: Publizon knows an order id, the
 * service layer a loan id.
 */
export const readerUrl = (id: string, provider?: DigitalProvider | null) => {
  const parameter = provider === "serviceLayer" ? "loanid" : "orderid";
  return new URL(
    `/reader?${parameter}=${encodeURIComponent(id)}`,
    window.location.href
  );
};

/**
 * Where a service layer audiobook loan plays.
 *
 * Only service layer loans have a page to play on - Publizon audiobooks play
 * in a modal, so no Publizon key ever links here.
 */
export const playerUrl = (loanId: string) =>
  new URL(`/player?loanid=${encodeURIComponent(loanId)}`, window.location.href);

/**
 * Whether a loan from this provider plays in the Publizon modal.
 *
 * Service layer loans play on the player page instead (see `playerUrl`), so a
 * caller that owns a `PlayerModal` only needs to mount it when this is true.
 */
export const playsInModal = (provider?: DigitalProvider | null) =>
  provider !== "serviceLayer";

/**
 * Where a sample of a material opens.
 *
 * A sample has no loan to read the material type from, so the route carries
 * it: e-books sample on the reader page, audiobooks on the player page.
 */
export const sampleUrl = (
  identifier: DigitalMaterialId,
  materialType: "ebook" | "audiobook"
) =>
  new URL(
    `/${materialType === "audiobook" ? "player" : "reader"}?identifier=${encodeURIComponent(identifier)}`,
    window.location.href
  );

export const readerTypes = [
  ManifestationMaterialType.ebook,
  ManifestationMaterialType.pictureBookOnline,
  ManifestationMaterialType.animatedSeriesOnline,
  ManifestationMaterialType.yearBookOnline
];

export const playerTypes = [
  ManifestationMaterialType.audioBook,
  ManifestationMaterialType.podcast,
  ManifestationMaterialType.musicOnline,
  ManifestationMaterialType.audioBookTape
];

const opensIn = (manifestation: Manifestation): "reader" | "player" | null => {
  const materialTypes = getMaterialTypes([manifestation]);

  if (readerTypes.some((type) => materialTypes.includes(type))) return "reader";
  if (playerTypes.some((type) => materialTypes.includes(type))) return "player";

  return null;
};

export type DigitalLoanable = {
  manifestation: Manifestation;
  id: DigitalMaterialId;
  opensIn: "reader" | "player";
};

/**
 * The edition of a material type that is lent out, the id it is lent by and
 * where it opens - or null when nothing can be lent. One answer for the
 * label, the availability text, the buttons and the page layout, so they
 * cannot disagree about which edition they act on.
 */
export const getDigitalLoanable = (
  manifestations: Manifestation[]
): DigitalLoanable | null => {
  const manifestation = getLoanableManifestation(manifestations);
  if (!manifestation) return null;

  const id = getManifestationDigitalIdentifier(manifestation);
  if (id === null) return null;

  const type = opensIn(manifestation);
  if (type === null) {
    warnUnopenableType(manifestation);
    return null;
  }
  return { manifestation, id, opensIn: type };
};

// FBI catalogues the same e-book format under several types, so a provider
// can lend a title whose type is in neither list above. The page then shows
// no loan button; say so once per type, in production too, since new types
// turn up in live data rather than in fixtures.
const warnedTypes = new Set<string>();
const warnUnopenableType = (manifestation: Manifestation) => {
  const type = getMaterialTypes([manifestation])[0] ?? "";
  if (warnedTypes.has(type)) return;
  warnedTypes.add(type);
  // eslint-disable-next-line no-console
  console.warn(
    `A digital material of type "${type}" can be lent but opens in neither reader nor player - add the type to readerTypes or playerTypes`
  );
};

export const findReservedReservation = (
  identifier: DigitalMaterialId,
  reservations: ReservationType[]
) =>
  reservations.find(
    (reservation) =>
      reservation.identifier === identifier && reservation.state === "reserved"
  );
