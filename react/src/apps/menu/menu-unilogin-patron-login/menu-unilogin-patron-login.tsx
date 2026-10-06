import React, { FC, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useText } from "../../../core/utils/text";
import { useConfig } from "../../../core/utils/config";
import Modal, {
  useIsModalOpen,
  useIsTopModal,
  useModalButtonHandler
} from "../../../core/utils/modal";
import { Button } from "../../../components/Buttons/Button";
import { setAskStudentBeforePatronLogin } from "../../../core/unilogin-user";
import { removeRequest } from "../../../core/guardedRequests.slice";
import { closeModal } from "../../../core/modal.slice";

export const uniloginPatronLoginModalId = "unilogin-patron-login";

// Asks a Unilogin student before a patron login logs the student out.
const MenuUniloginPatronLogin: FC = () => {
  const t = useText();
  const dispatch = useDispatch();
  const { open, close } = useModalButtonHandler();
  const proceedRef = useRef<(() => void) | null>(null);
  const isOpen = useIsModalOpen(uniloginPatronLoginModalId);
  const isTopModal = useIsTopModal(uniloginPatronLoginModalId);
  const config = useConfig();
  const isUniloginUser = Boolean(config("uniloginUserIdConfig"));

  useEffect(() => {
    if (!isUniloginUser) {
      return undefined;
    }
    setAskStudentBeforePatronLogin((proceed) => {
      proceedRef.current = proceed;
      open(uniloginPatronLoginModalId, { updateUrl: false });
    });
    return () => setAskStudentBeforePatronLogin(null);
  }, [isUniloginUser, open]);

  // However the question is closed without confirming - its cancel button,
  // the close button, the backdrop or Escape - the patron login is dropped,
  // and a guarded request stored for after it must not run at a later login.
  // The login only waits while the question is open: it is set before the
  // question opens, and a confirm clears it before closing.
  useEffect(() => {
    if (!isOpen && proceedRef.current) {
      proceedRef.current = null;
      dispatch(removeRequest());
    }
  }, [isOpen, dispatch]);

  // Reopened from the URL, e.g. after a reload, the question has no patron
  // login to go on with, so it is closed and the action stored for after that
  // login is dropped. closeModal() also closes the top modal, so this waits
  // until the question is on top.
  useEffect(() => {
    if (isTopModal && !proceedRef.current) {
      dispatch(closeModal({ modalId: uniloginPatronLoginModalId }));
      dispatch(removeRequest());
    }
  }, [isTopModal, dispatch]);

  const onConfirm = () => {
    const proceed = proceedRef.current;
    proceedRef.current = null;
    close(uniloginPatronLoginModalId);
    proceed?.();
  };

  const onCancel = () => close(uniloginPatronLoginModalId);

  // Modals also open from the URL, so a visitor who is not a Unilogin student
  // must not have this one at all.
  if (!isUniloginUser) {
    return null;
  }

  return (
    <Modal
      modalId={uniloginPatronLoginModalId}
      classNames="modal-right modal--no-padding"
      closeModalAriaLabelText={t("uniloginPatronLoginCancelText")}
      screenReaderModalDescriptionText={t("uniloginPatronLoginHeadingText")}
      isSlider
    >
      <div className="modal-login modal-login--anonymous modal-padding">
        <h2 className="text-header-h3">
          {t("uniloginPatronLoginHeadingText")}
        </h2>
        <p className="modal-login__text text-body-medium-regular mt-16">
          {t("uniloginPatronLoginDescriptionText")}
        </p>
        <p className="modal-login__text text-body-medium-regular mt-16 mb-32">
          {t("uniloginPatronLoginLogoutText")}
        </p>
        <Button
          label={t("uniloginPatronLoginConfirmText")}
          buttonType="none"
          size="large"
          variant="filled"
          collapsible={false}
          onClick={onConfirm}
        />
        <Button
          classNames="mt-16"
          label={t("uniloginPatronLoginCancelText")}
          buttonType="none"
          size="large"
          variant="outline"
          collapsible={false}
          onClick={onCancel}
        />
      </div>
    </Modal>
  );
};

export default MenuUniloginPatronLogin;
