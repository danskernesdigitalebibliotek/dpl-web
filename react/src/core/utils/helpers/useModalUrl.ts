import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";
import { isEqual } from "lodash";
import {
  openModal,
  closeModal,
  ModalId,
  ModalIdsProps
} from "../../modal.slice";
import { getUrlQueryParam } from "./url";

// The modal stack lives in the "modal" query parameter as a comma-separated
// list. Modal ids are hyphen-joined (see constructModalId) and never contain
// commas, so the separator is safe. nuqs keeps ":" readable on its own, which
// is why the modal slice no longer needs to prettify the URL by hand.
const modalQueryParser = parseAsArrayOf(parseAsString).withDefault([]);

// Read the modal stack from the address bar outside React, e.g. in effects
// that deliberately run once on data load. Keeps knowledge of the wire format
// above in this module instead of consumers substring-matching the raw
// parameter.
export const getModalIdsFromUrl = (): ModalId[] => {
  const param = getUrlQueryParam("modal");
  return param ? (modalQueryParser.parse(param) ?? []) : [];
};

/**
 * Bridges the modal stack (Redux) with the `modal` URL query parameter via
 * nuqs, replacing the imperative history writes that used to live inside the
 * modal reducer. The sync is two-way:
 *
 * - URL changes that did not come from the stack (initial load, back/forward)
 *   reconcile the stack: modals encoded in the URL open — e.g. when a guarded
 *   modal sends an anonymous user through login and back — and modals missing
 *   from it close, so Back closes the modal it opened.
 * - Stack changes mirror into the address bar: opening pushes a history entry
 *   (which is what lets Back close it again), closing replaces.
 */
export const useModalUrl = () => {
  const dispatch = useDispatch();
  const { modalIds } = useSelector((state: ModalIdsProps) => state.modal);
  const [urlModalIds, setUrlModalIds] = useQueryState(
    "modal",
    modalQueryParser
  );
  // Previous values tell the effect which side moved. The URL ref starts
  // empty so the first run treats ids already present in the URL as a URL
  // change and hydrates the stack from them.
  const previousModalIds = useRef<ModalId[]>(modalIds);
  const previousUrlModalIds = useRef<ModalId[]>([]);

  useEffect(() => {
    const stackChanged = !isEqual(previousModalIds.current, modalIds);
    const urlChanged = !isEqual(previousUrlModalIds.current, urlModalIds);
    const isOpening = modalIds.length > previousModalIds.current.length;
    previousModalIds.current = modalIds;
    previousUrlModalIds.current = urlModalIds;

    if (isEqual(modalIds, urlModalIds)) {
      return;
    }

    if (urlChanged && !stackChanged) {
      // The URL moved on its own: make the stack follow it. Close topmost
      // first — closeModal pops the top of the stack before removing by id.
      [...modalIds]
        .reverse()
        .filter((modalId) => !urlModalIds.includes(modalId))
        .forEach((modalId) => dispatch(closeModal({ modalId })));
      urlModalIds
        .filter((modalId) => !modalIds.includes(modalId))
        .forEach((modalId) => dispatch(openModal({ modalId })));
      return;
    }

    setUrlModalIds(modalIds.length > 0 ? modalIds : null, {
      history: isOpening ? "push" : "replace"
    });
  }, [dispatch, modalIds, urlModalIds, setUrlModalIds]);
};

// Renders nothing. Mounted once per React root by <Store> so the URL<->stack
// sync is a singleton concern instead of running inside every <Modal>.
export const ModalUrlSync: React.FC = () => {
  useModalUrl();
  return null;
};
