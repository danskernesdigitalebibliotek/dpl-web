import { useConfig } from "../utils/config";

/**
 * TEMPORARY WORKAROUND - remove when the catalogue and the adapter agree.
 *
 * During the transition FBI's catalogue lists digital materials that are not
 * yet provisioned in WeDoBooks, and the adapter answers can-loan for those
 * with a 404 ("Material not found"). With errors surfaced, that takes the
 * error boundary - and the whole material page - down for a material the
 * library simply cannot lend yet.
 *
 * With this flag on, such a material is rendered as unavailable instead: no
 * crash, no falling back to Publizon. Off by default, because a 404 from
 * can-loan is normally a mistake worth hearing about - once the catalogues
 * are aligned this flag and every `allowNotFound` it feeds should go.
 *
 * Set in the CMS next to the adapter flag, shipped to every app as
 * data-biblio-tolerate-unknown-materials-config.
 */
const useBiblioTolerateUnknownMaterials = (): boolean => {
  const config = useConfig();

  try {
    return config("biblioTolerateUnknownMaterialsConfig") === "1";
  } catch {
    // An older CMS release ships no such config; keep failing loudly.
    return false;
  }
};

export default useBiblioTolerateUnknownMaterials;
