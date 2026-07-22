import { createSlice } from "@reduxjs/toolkit";

export type ModalId = string;

// The modal slice as seen from the root state — the one canonical shape for
// every selector that reads the modal stack.
export type ModalIdsProps = {
  modal: {
    modalIds: ModalId[];
  };
};

interface PayloadProps {
  payload: {
    modalId: ModalId;
  };
}

interface StateProps {
  modalIds: string[];
}
const focusContainerArray: Element[] = [];
const storeFocusElement = (elementToStore?: Element) => {
  if (elementToStore) {
    return focusContainerArray.push(elementToStore);
  }
  return false;
};

const returnFocusElement = () => {
  const element = focusContainerArray.pop() as HTMLElement;
  if (element) {
    element.focus();
  }
  return element;
};

const modalSlice = createSlice({
  name: "modal",
  initialState: { modalIds: [] },
  reducers: {
    openModal(state: StateProps, action: PayloadProps) {
      // Disables background scrolling whilst the Modal is open
      if (typeof window !== "undefined" && window.document) {
        document.body.style.overflow = "hidden";
      }

      // If there is a modalid in the payload, and if this modalid is not saved
      // then save the modalid. Syncing the id into the URL is handled by
      // useModalUrl, so the reducer no longer touches the URL — the
      // scroll-lock and focus-store side effects in here predate that split
      // and still make the reducer impure.
      if (
        action.payload.modalId &&
        !state.modalIds.includes(action.payload.modalId)
      ) {
        state.modalIds.push(action.payload.modalId);
      }
      const { activeElement } = document;
      // Prevent body from double triggering focus store when url contains modalId
      if (activeElement && activeElement.tagName !== "BODY") {
        storeFocusElement(activeElement);
      }
    },
    closeModal(state: StateProps, action: PayloadProps) {
      const modalId = state.modalIds.pop();
      // Check if the modalId from action payload exists in state.modalIds; if so, remove it:
      if (state.modalIds.indexOf(action.payload.modalId) > -1) {
        state.modalIds.splice(
          state.modalIds.indexOf(action.payload.modalId),
          1
        );
      }
      if (modalId) {
        returnFocusElement();
      }
      // Enables background scrolling to use when last modal is closed
      if (state.modalIds.length === 0) {
        document.body.style.overflow = "";
      }
    },
    closeLastModal(state: StateProps) {
      // Enables background scrolling to use when Modal is closed
      document.body.style.overflow = "";
      const modalId = state.modalIds.pop();
      if (modalId) {
        returnFocusElement();
      }
    },
    closeAllModals(state: StateProps) {
      // Enables background scrolling to use when Modal is closed
      document.body.style.overflow = "";
      state.modalIds = [];
      returnFocusElement();
    }
  }
});

export const { openModal, closeModal, closeLastModal, closeAllModals } =
  modalSlice.actions;

export default modalSlice.reducer;
