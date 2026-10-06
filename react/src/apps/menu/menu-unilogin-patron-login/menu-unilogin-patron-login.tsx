import React, { FC, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useText } from "../../../core/utils/text";
import { useConfig } from "../../../core/utils/config";
import Modal, { useModalButtonHandler } from "../../../core/utils/modal";
import { Button } from "../../../components/Buttons/Button";
import { setAskStudentBeforePatronLogin } from "../../../core/unilogin-user";
import { removeRequest } from "../../../core/guardedRequests.slice";

export const uniloginPatronLoginModalId = "unilogin-patron-login";

// Asks a Unilogin student before a patron login logs the student out.
const MenuUniloginPatronLogin: FC = () => {
  const t = useText();
  const dispatch = useDispatch();
  const { open, close } = useModalButtonHandler();
  const proceedRef = useRef<(() => void) | null>(null);
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

  const cancel = () => {
    proceedRef.current = null;
    // A guarded request stored for after login must not run at a later login.
    dispatch(removeRequest());
  };

  const onConfirm = () => {
    const proceed = proceedRef.current;
    proceedRef.current = null;
    close(uniloginPatronLoginModalId);
    proceed?.();
  };

  const onCancel = () => {
    cancel();
    close(uniloginPatronLoginModalId);
  };

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
      eventCallbacks={{ close: cancel }}
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
